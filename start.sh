#!/bin/bash

# Kill anything on these ports first
kill -9 $(lsof -ti:5173) 2>/dev/null  # React
kill -9 $(lsof -ti:8000) 2>/dev/null  # Node
kill -9 $(lsof -ti:8000) 2>/dev/null  # FastAPI
kill -9 $(lsof -ti:6379) 2>/dev/null  # Redis

echo "Starting all services..."

redis-server &
cd server && npm run dev & 
cd client && npm run dev &
uvicorn scanner.main:app --reload & 
echo "All services started successfully!"
wait

