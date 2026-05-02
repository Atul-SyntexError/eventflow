# EventFlow - Role-Based Event Management System

## 📌 Project Info

**Project Name:** EventFlow  
**Description:** A professional, role-based event management system built with Java. It handles comprehensive event operations including user roles, registration, task management, notifications, and schedule adjustments. It provides a robust backend with session management, role-based access control, and a clean, responsive UI.  
**Features:**

- **Role-Based Access Control:** Secure portal for Admins, Organizers, Volunteers, and Students.
- **Event Management:** Create, update, and monitor live event operations.
- **Task Orchestration:** Assign and track tasks with dependencies and real-time updates.
- **Attendance & Registration:** Seamless student registration and check-in flow.
- **Dashboard Analytics:** Live metrics, operations pulse, and assignment momentum.
- **Dark/Light Mode:** Integrated theme toggle for an enhanced user experience.

## ⚙️ Tech Stack

- **Frontend:** HTML5, CSS3 (Custom Design System / Tokens), JavaScript, JSP (JavaServer Pages)
- **Backend:** Java 17, Jakarta Servlet API, MVC Architecture
- **Database:** MySQL 8.x
- **Build Tool:** Maven (Wrapper)
- **Server:** Apache Tomcat 10.x

## 🚀 Setup Instructions

*Note: This project is a monolithic Java Web Application, meaning the frontend and backend run together on the Apache Tomcat server rather than as separate Node.js/React applications.*

### 1. Clone Repo

```bash
git clone <repo-link>
cd eventflow
```

### 2. Database Setup

Ensure you have MySQL installed and running.

- **MySQL username:** root
- **Password:** 2592
- Execute the database creation script or run manually:

  ```sql
  CREATE DATABASE eventflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  ```

- Seed the database using the provided PowerShell script (Windows) or Bash script (Mac/Linux):

  ```powershell
  .\scripts\seed-local-db.ps1
  ```

### 3. Backend & Frontend Setup (Build & Deploy)

Since this is a unified Java project, you package the backend and frontend together into a `.war` file using Maven.

```powershell
# Build the application using Maven Wrapper
.\mvnw.cmd -q -DskipTests package
```

Deploy the generated `target/event-flow.war` to your local Apache Tomcat 10.x server's `webapps` directory.

You can also use the automated bootstrap script which seeds the DB, builds the WAR, and deploys it automatically:

```powershell
.\scripts\bootstrap-local.ps1
```

## 🌐 Run Project

- **Application URL:** [http://localhost:8080/event-flow/login.jsp](http://localhost:8080/event-flow/login.jsp)
*(Runs combined on port 8080 via Tomcat)*

### Seeded Accounts for Testing

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@eventflow.local` | `Admin123!` |
| Organizer | `organizer@eventflow.local` | `Organizer123!` |
| Volunteer | `volunteer@eventflow.local` | `Volunteer123!` |
| Student | `student@eventflow.local` | `Student123!` |

## 🛠 Common Errors + Fix

- **Module not found / Build failures:**
  Ensure you are using Java 17. Run `java -version` to verify. Use `.\mvnw.cmd clean package` to clear cache and rebuild.
- **DB connection error:**
  Verify your MySQL credentials. By default, the app connects using `root` and `2592`. Ensure the `eventflow` database was created and seeded correctly. If you get connection refused, make sure the MySQL service is running on port 3306.
- **Port issues:**
  If port 8080 is already in use, you can change the Tomcat server port in `conf/server.xml` within your Tomcat installation directory. Find `<Connector port="8080" ... />` and change `8080` to another port like `8081`.
- **Blank pages or 404s after deploy:**
  Clear your Tomcat cache by deleting the contents of `work/Catalina/localhost` and `temp/` directories inside your Tomcat folder, then restart Tomcat.

## ?? Cloud Deployment Guide

To get a live link for your GitHub portfolio, you can deploy this application for free using **Koyeb** (for the Java app) and **TiDB Serverless** (for the MySQL database).

### 1. Provision a Free MySQL Database
1. Go to [TiDB Cloud](https://tidbcloud.com/) and create a free account.
2. Create a new **Serverless Tier** cluster (this provides a generous free MySQL-compatible database without region limits).
3. Click "Connect" and get your connection details: **Host**, **Port**, **User**, and **Password**.

### 2. Deploy the Application
We have included a Dockerfile that packages the application into an executable Tomcat container.
1. Create a free account on [Koyeb](https://www.koyeb.com/) (or Render).
2. Click **Create Web Service** and connect your GitHub repository.
3. Choose **Dockerfile** as the build method.
4. Set the container port to 8080.
5. Add the following **Environment Variables** so the app can connect to your new database:
   - EVENTFLOW_APP_ENVIRONMENT = production
   - EVENTFLOW_DB_URL = jdbc:mysql://<your-tidb-host>:<port>/test?useSSL=true
   - EVENTFLOW_DB_USERNAME = <your-tidb-user>
   - EVENTFLOW_DB_PASSWORD = <your-tidb-password>
6. Deploy! Koyeb will build the image and give you a live URL.
