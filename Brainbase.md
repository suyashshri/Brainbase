# BrainBase

## What's inside?

In this project we have used a Monorepo which has one nextjs project for frontend and an express app as an backend.

## Inside Backend

- We are using a express as a server which has clerk based authentication.
- We are using s3 bucket as an object store where we will put our pdf and other files.
- We will use OpenAI for embedding i.e; to convert pdf,png,jpeg into enbeddings.
- We are using pinecone Db as a vector database i.e; to store vectors of pdf and other objects
