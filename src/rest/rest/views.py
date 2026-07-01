from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import os
from pymongo import MongoClient
from bson import ObjectId
from bson.errors import InvalidId

mongo_uri = 'mongodb://' + os.environ["MONGO_HOST"] + ':' + os.environ["MONGO_PORT"]
db = MongoClient(mongo_uri)['test_db']

class TodoListView(APIView):

    def get(self, request):
        try:
            todos = []

            for todo in db.todos.find():
                todos.append({
                    "id": str(todo["_id"]),
                    "description": todo.get("description", "")
                })

            return Response(todos, status=status.HTTP_200_OK)
        except Exception:
            return Response(
                {"error": "Failed to fetch todos"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):
        try:
            description = request.data.get("description", "")
            if not isinstance(description, str):
                return Response(
                    {"error": "Description is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            description = description.strip()

            if not description:
                return Response(
                    {"error": "Description is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            result = db.todos.insert_one({
                "description": description
            })

            return Response(
                {
                    "id": str(result.inserted_id),
                    "description": description,
                },
                status=status.HTTP_201_CREATED
            )
        except Exception:
            return Response(
                {"error": "Failed to create todo"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def put(self, request):
        try:
            todo_id = request.data.get("id", "")
            description = request.data.get("description", "")

            if not isinstance(todo_id, str) or not todo_id.strip():
                return Response(
                    {"error": "Todo id is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if not isinstance(description, str):
                return Response(
                    {"error": "Description is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            description = description.strip()
            if not description:
                return Response(
                    {"error": "Description is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                object_id = ObjectId(todo_id)
            except (InvalidId, TypeError, ValueError):
                return Response(
                    {"error": "Invalid todo id"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            result = db.todos.update_one(
                {"_id": object_id},
                {"$set": {"description": description}}
            )

            if result.matched_count == 0:
                return Response(
                    {"error": "Todo not found"},
                    status=status.HTTP_404_NOT_FOUND
                )

            updated_todo = db.todos.find_one({"_id": object_id})

            return Response(
                {
                    "id": str(updated_todo["_id"]),
                    "description": updated_todo.get("description", ""),
                },
                status=status.HTTP_200_OK
            )
        except Exception:
            return Response(
                {"error": "Failed to update todo"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def delete(self, request):
        try:
            todo_id = request.data.get("id", "")

            if not isinstance(todo_id, str) or not todo_id.strip():
                return Response(
                    {"error": "Todo id is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                object_id = ObjectId(todo_id)
            except (InvalidId, TypeError, ValueError):
                return Response(
                    {"error": "Invalid todo id"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            result = db.todos.delete_one({"_id": object_id})

            if result.deleted_count == 0:
                return Response(
                    {"error": "Todo not found"},
                    status=status.HTTP_404_NOT_FOUND
                )

            return Response(
                {"message": "Todo deleted", "id": todo_id},
                status=status.HTTP_200_OK
            )
        except Exception:
            return Response(
                {"error": "Failed to delete todo"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

