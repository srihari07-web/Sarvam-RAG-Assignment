# RAG System with Smart Agent

![Header Image]('./rag.png')


## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Setup Instructions](#setup-instructions)
  - [Backend Setup Instructions](#backend-setup-instructions)
  - [Frontend Setup Instructions](#frontend-setup-instructions)
- [Endpoints](#endpoints)
- [Usage](#usage)

- [License](#license)

## Introduction
This project implements a Retrieval-Augmented Generation (RAG) system using FastAPI. It utilizes a vector database to retrieve relevant information from NCERT text data and provides an intelligent agent capable of performing smart actions based on user queries.

## Features
- **RAG System:** Leverages a vector database and a language model to answer user queries based on NCERT text data.
- **Smart Agent:** Determines whether to query the vector database or provide immediate responses based on the context of the user’s query.
- **Multiple Actions:** Capable of performing additional actions based on user queries.

## Technologies Used
- Python
- FastAPI
- Sentence Transformers
- FAISS (Facebook AI Similarity Search)
- Cohere API
- Langchain Community Tools
- CORS Middleware for API accessibility
- Environment Variables for API Keys

## Setup Instructions

### Backend Setup Instructions

#### Prerequisites
Make sure you have Python 3.7+ installed on your machine.

1. **Clone the repository**
   ```bash
   git clone https://github.com/srihari07-web/sarvam-RAG-Assignment.git
   cd sarvam-RAG-Assignment
   ```

2. **Install Dependencies**
   Navigate to the backend folder and install the required dependencies using pip:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```


4. **Run the FastAPI Application**
   To start the FastAPI server, run:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup Instructions

#### Prerequisites
Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (version 14.x or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)

#### Getting Started

1. **Navigate to the Repository**
   ```bash
   cd frontend
   ```

2. **Install Dependencies**
   Navigate to the frontend directory and run the following command to install the necessary dependencies:
   ```bash
   npm install
   ```


4. **Start the Server**
   Once all dependencies are installed, start your backend server with:
   ```bash
   npm start
   ```
   The server should now be running on [http://localhost:8000](http://localhost:8000).

5. **Testing the Endpoints**
   You can test the backend endpoints using tools like [Postman](https://www.postman.com/) or [curl](https://curl.se/).

   - To query the API, send a POST request to `http://localhost:8000/query` with the following JSON body:
     ```json
     {
       "query": "Your query here"
     }
     ```

   - For web search, send a POST request to `http://localhost:8000/web-search` with:
     ```json
     {
       "query": "Your search term here"
     }
     ```

   - To interact with the smart agent, send a POST request to `http://localhost:8000/agent` with:
     ```json
     {
       "input": "Your input here"
     }
     ```

## Endpoints
- **POST /query**: Accepts a user query and returns the corresponding response from the RAG system.
- **POST /web-search**: Accepts a search term and returns web search results.
- **POST /agent**: Accepts user input for processing and returns a smart response based on the context of the query.

## Usage
1. Start both backend and frontend servers as described above.
2. Interact with the frontend application to send queries and receive responses.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---
