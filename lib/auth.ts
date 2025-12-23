"use client"

import { MOCK_USERS, type User } from "./mock-data"

const AUTH_KEY = "skincare_auth_user"

export function login(email: string, password: string): User | null {
  const user = MOCK_USERS.find((u) => u.email === email && u.password === password)

  if (user) {
    // Store user without password
    const { password: _, ...userWithoutPassword } = user
    localStorage.setItem(AUTH_KEY, JSON.stringify(userWithoutPassword))
    return user
  }

  return null
}

export function signup(email: string, password: string, name: string): User {
  const newUser: User = {
    id: `customer-${Date.now()}`,
    email,
    password,
    name,
    role: "customer",
  }

  MOCK_USERS.push(newUser)
  const { password: _, ...userWithoutPassword } = newUser
  localStorage.setItem(AUTH_KEY, JSON.stringify(userWithoutPassword))

  return newUser
}

export function logout() {
  localStorage.removeItem(AUTH_KEY)
}

export function getCurrentUser(): Omit<User, "password"> | null {
  if (typeof window === "undefined") return null

  const stored = localStorage.getItem(AUTH_KEY)
  if (!stored) return null

  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null
}
