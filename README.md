Instructions to setup and run our app (VSCode preferred):
1. Unzip the file and open the project folder
2. Ensure you are in the backend. Paste & run: cd backend
3. Create a virtual environment. Paste & run the following:
```bash
     python -m venv venv
     (IF WINDOWS): venv\Scripts\activate
     (IF MAC/LINUX): source venv/bin/activate
```
4. Ensure step 3 and paste:
      pip install -r requirements.txt
5. Create a .env file in the backend folder and paste the following:
```bash
      MYSQL_USER=root
      MYSQL_PASSWORD="your_mysql_password"
      MYSQL_HOST=localhost
      MYSQL_DB=flight_tracking
      MYSQL_PORT=3306
```
Replace 'your_mysql_password' with your password. Make sure it is quotation marks.  
6. Run app.py  
7. Create a new terminal window  
8. Go to the frontend folder (cd frontend)  
9. Run the following:
```bash
     npm install
     npm run start
```
10. The terminal should now display a front end. Open the local link (localhost:3000)

We used Flask to build our backend. Flask-CORS enabled communication between the frontend and backend. We used React + Vite to create the frontend, an interactive interface. Axios was used to make HTTP requests from the frontend to backend. SQL credentials are loaded from a .env file to run queries.

Rishabh and Caroline were in charge of building the backend and connecting it to our SQL database. Nix was in charge of designing the frontend and ensuring its functionality. Nevin worked on verifying and debugging the SQL code.
