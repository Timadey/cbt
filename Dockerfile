FROM python:3.9

# Set working directory
WORKDIR /cbt

# Copy the requirements file and install dependencies
COPY requirements.txt .

RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Install Node.js and npm
RUN apt-get update && apt-get install -y nodejs npm

# Copy the Flask app code into the container
COPY . .

# Set environment variables from .env file.
# **Replace /etc/secrets/.env with actual path of your .env if not in root dir
ENV $(cat /etc/secrets/.env | grep -v '#' | xargs)

# Install Node.js dependencies in the static directory
WORKDIR /cbt/app/static
RUN npm install

# Change back to the Flask app directory
WORKDIR /cbt

# Expose the port your app runs on
EXPOSE 5000

# Define the command to start the app
CMD ["flask", "run", "--host=0.0.0.0"]
