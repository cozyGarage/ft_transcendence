import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer

# Othello matchmaking queue
othello_queue = []


class OthelloGameConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time Othello multiplayer games"""

    rooms = {}  # Store active game rooms

    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"othello_{self.room_name}"
        self.player_id = None
        self.player_color = None

        # Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        await self.accept()

        # Initialize room if it doesn't exist
        if self.room_group_name not in OthelloGameConsumer.rooms:
            OthelloGameConsumer.rooms[self.room_group_name] = {
                "players": [],
                "board": self.create_initial_board(),
                "current_player": "B",
                "game_started": False,
                "game_over": False,
            }

        # Add player to room
        room = OthelloGameConsumer.rooms[self.room_group_name]
        if len(room["players"]) < 2:
            self.player_color = "B" if len(room["players"]) == 0 else "W"
            room["players"].append(
                {"channel_name": self.channel_name, "color": self.player_color}
            )

            # Send player assignment
            await self.send(
                text_data=json.dumps(
                    {
                        "type": "player_assigned",
                        "color": self.player_color,
                        "message": f"You are playing as {'Black' if self.player_color == 'B' else 'White'}",
                    }
                )
            )

            # Start game if both players connected
            if len(room["players"]) == 2:
                room["game_started"] = True
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "game_start",
                        "board": room["board"],
                        "current_player": room["current_player"],
                    },
                )

    def create_initial_board(self):
        """Create standard Othello starting position"""
        board = [["E" for _ in range(8)] for _ in range(8)]
        board[3][3] = "W"
        board[3][4] = "B"
        board[4][3] = "B"
        board[4][4] = "W"
        return board

    async def disconnect(self, close_code):
        # Notify opponent of disconnect
        if self.room_group_name in OthelloGameConsumer.rooms:
            room = OthelloGameConsumer.rooms[self.room_group_name]
            if not room["game_over"]:
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {"type": "player_disconnected", "message": "Opponent disconnected"},
                )

            # Remove player from room
            room["players"] = [
                p for p in room["players"] if p["channel_name"] != self.channel_name
            ]

            # Clean up empty rooms
            if len(room["players"]) == 0:
                del OthelloGameConsumer.rooms[self.room_group_name]

        # Leave room group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        """Handle incoming WebSocket messages"""
        data = json.loads(text_data)
        message_type = data.get("type")

        if message_type == "make_move":
            await self.handle_move(data)
        elif message_type == "chat":
            await self.handle_chat(data)

    async def handle_move(self, data):
        """Process and validate a move"""
        if self.room_group_name not in OthelloGameConsumer.rooms:
            return

        room = OthelloGameConsumer.rooms[self.room_group_name]

        # Validate it's the player's turn
        if self.player_color != room["current_player"]:
            await self.send(
                text_data=json.dumps({"type": "error", "message": "Not your turn"})
            )
            return

        row = data["row"]
        col = data["col"]

        # Validate and make move
        if self.is_valid_move(room["board"], row, col, self.player_color):
            self.make_move(room["board"], row, col, self.player_color)

            # Switch turn
            room["current_player"] = "W" if room["current_player"] == "B" else "B"

            # Check if game is over
            if self.is_game_over(room["board"]):
                room["game_over"] = True
                winner = self.get_winner(room["board"])

                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "game_over",
                        "board": room["board"],
                        "winner": winner,
                        "score": self.get_score(room["board"]),
                    },
                )
            else:
                # Broadcast move to both players
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "move_made",
                        "board": room["board"],
                        "current_player": room["current_player"],
                        "row": row,
                        "col": col,
                    },
                )
        else:
            await self.send(
                text_data=json.dumps({"type": "error", "message": "Invalid move"})
            )

    def is_valid_move(self, board, row, col, player):
        """Check if a move is valid"""
        if board[row][col] != "E":
            return False

        directions = [
            (-1, -1),
            (-1, 0),
            (-1, 1),
            (0, -1),
            (0, 1),
            (1, -1),
            (1, 0),
            (1, 1),
        ]
        opponent = "W" if player == "B" else "B"

        for dr, dc in directions:
            r, c = row + dr, col + dc
            found_opponent = False

            while 0 <= r < 8 and 0 <= c < 8:
                if board[r][c] == opponent:
                    found_opponent = True
                elif board[r][c] == player and found_opponent:
                    return True
                else:
                    break
                r += dr
                c += dc

        return False

    def make_move(self, board, row, col, player):
        """Execute a move and flip pieces"""
        board[row][col] = player
        directions = [
            (-1, -1),
            (-1, 0),
            (-1, 1),
            (0, -1),
            (0, 1),
            (1, -1),
            (1, 0),
            (1, 1),
        ]
        opponent = "W" if player == "B" else "B"

        for dr, dc in directions:
            to_flip = []
            r, c = row + dr, col + dc

            while 0 <= r < 8 and 0 <= c < 8:
                if board[r][c] == opponent:
                    to_flip.append((r, c))
                elif board[r][c] == player:
                    for flip_r, flip_c in to_flip:
                        board[flip_r][flip_c] = player
                    break
                else:
                    break
                r += dr
                c += dc

    def is_game_over(self, board):
        """Check if game is over"""
        return (
            len(self.get_valid_moves(board, "B")) == 0
            and len(self.get_valid_moves(board, "W")) == 0
        )

    def get_valid_moves(self, board, player):
        """Get all valid moves for a player"""
        moves = []
        for row in range(8):
            for col in range(8):
                if self.is_valid_move(board, row, col, player):
                    moves.append((row, col))
        return moves

    def get_score(self, board):
        """Count pieces for each player"""
        black = sum(row.count("B") for row in board)
        white = sum(row.count("W") for row in board)
        return {"B": black, "W": white}

    def get_winner(self, board):
        """Determine winner"""
        score = self.get_score(board)
        if score["B"] > score["W"]:
            return "B"
        elif score["W"] > score["B"]:
            return "W"
        return None

    # WebSocket event handlers
    async def game_start(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "type": "game_start",
                    "board": event["board"],
                    "current_player": event["current_player"],
                }
            )
        )

    async def move_made(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "type": "move_made",
                    "board": event["board"],
                    "current_player": event["current_player"],
                    "row": event["row"],
                    "col": event["col"],
                }
            )
        )

    async def game_over(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "type": "game_over",
                    "board": event["board"],
                    "winner": event["winner"],
                    "score": event["score"],
                }
            )
        )

    async def player_disconnected(self, event):
        await self.send(
            text_data=json.dumps(
                {"type": "player_disconnected", "message": event["message"]}
            )
        )

    async def handle_chat(self, data):
        """Handle chat messages"""
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": data["message"],
                "sender": self.player_color,
            },
        )

    async def chat_message(self, event):
        await self.send(
            text_data=json.dumps(
                {"type": "chat", "message": event["message"], "sender": event["sender"]}
            )
        )
