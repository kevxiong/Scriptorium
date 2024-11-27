// pages/profile.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import './profile.css';
// Define a type for the user data
interface User {
    firstName: string;
    lastName: string;
    avatar?: string; // Optional property for avatar
    phoneNumber?: string; // Optional property for phone number
  }

const ProfilePage = () => {
    const router = useRouter();
    const { userid } = router.query;
    const [user, setUser] = useState<User | null>(null); 
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [avatar, setAvatar] = useState('');
    const [phone, setPhoneNumber] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            if (typeof userid === 'string') {
                try {
                    const response = await fetch(`/api/auth/profile?userid=${userid}`);
                    const data = await response.json();
                    setUser(data);
                    setFirstName(data.firstName);
                    setLastName(data.lastName);
                    setAvatar(data.avatar);
                    setPhoneNumber(data.phone);
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            }
        };

        fetchUserData();
    }, [userid]);

    const handleEditClick = () => {
        setIsEditing(true);
    };
    
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => { 
        const { name, value } = event.target;
        switch (name) {
          case 'firstName':   
    
            setFirstName(value);
            break;
          case 'lastName':
            setLastName(value);
            break;   
    
          case 'avatar':
            setAvatar(value);
            break;
          case 'phoneNumber':
            setPhoneNumber(value);
            break;
        }
      };

    const handleSaveClick = async () => {
        if (typeof userid === 'string') {
            try {
                const response = await fetch(`/api/auth/profile?userid=${userid}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userid,
                        firstName,
                        lastName,
                        avatar,
                        phone,
                    }),
                });
                const data = await response.json();
                setUser(data);
                setIsEditing(false);
            } catch (error) {
                console.error('Error updating user data:', error);
            }
        }
    };

    if (!user) {
        return <div>User not found</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Profile</h1>
            <div className="bg-white rounded-lg shadow-md p-6">
                {isEditing ? (
                    <form>
                        <div className="mb-4">
                            <label htmlFor="firstName" className="block text-gray-700 font-bold mb-2">
                                First Name:
                            </label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={firstName}
                                onChange={handleInputChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="lastName" className="block text-gray-700 font-bold mb-2">
                                Last Name:
                            </label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={lastName}
                                onChange={handleInputChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="avatar" className="block text-gray-700 font-bold mb-2">
                                Avatar URL:
                            </label>
                            <input
                                type="text"
                                id="avatar"
                                name="avatar"
                                value={avatar}
                                onChange={handleInputChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="phoneNumber" className="block text-gray-700 font-bold mb-2">
                                Phone Number:
                            </label>
                            <input
                                type="text"
                                id="phoneNumber"
                                name="phoneNumber"
                                value={phone}
                                onChange={handleInputChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleSaveClick}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Save
                        </button>
                    </form>
                ) : (
                    <>
                        <div className="mb-4">
                            <span className="font-bold">First Name:</span> {user.firstName}
                        </div>
                        <div className="mb-4">
                            <span className="font-bold">Last Name:</span> {user.lastName}
                        </div>
                         <div className="mb-4">
                            <span className="font-bold">Avatar:</span>
                            <img src={user.avatar} alt="Avatar" className="w-24 h-24 rounded-full" />
                        </div>
                        <div className="mb-4">
                            <span className="font-bold">Phone Number: {phone}</span>
                        </div>
                        <button
                            type="button"
                            onClick={handleEditClick}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Edit
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
