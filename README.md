# 🏡 HouseHub

**HouseHub** is a full-stack web application built with **Laravel** and **React** for managing househubs, buildings, apartments, roles, and residents. It includes secure authentication, full email verification, and an intuitive admin interface.

---

## 🔐 Authentication & Security

* User registration, login, and logout
* **Email verification** on signup
* Email becomes unverified when updated
* Secure **SPA authentication** using Laravel Sanctum

---

## 🏢 HouseHub Management

* Create and manage **HouseHubs**
* Assign **roles** to each HouseHub
* Manage buildings, apartments, and residents
* Full **CRUD** operations across all entities
* **Announcements:** Authorized users can create announcements visible to all users related to the HouseHub on the HouseHub page

---

## 📄 ERD

You can view the **Entity-Relationship Diagram (ERD)** [here](./docs/house_hub_ERD.pdf).

---

## 👥 Resident & Role System

* Add residents to apartments
* Manage resident information
* Assign roles (**Admin**, **Manager**, **Resident**, etc.)
* **Role-based access** handling

---

## 📬 Email System

* Email verification support
* Re-send verification email
* Auto-send verification when email changes

---

## 🖥️ Frontend

* **React SPA** built with **Vite**
* Axios for API communication
* Uses Sanctum-protected backend APIs
* Clean and simple UI for all CRUD actions

---

## ⚙️ Tech Stack

| Component | Technology |
| :--- | :--- |
| **Backend** | Laravel |
| **Frontend** | React (Vite) |
| **Authentication** | Laravel Sanctum |
| **Database** | MySQL |
| **Mail** | SMTP |
