// types/user.ts
export interface User {
  _id?: string
  name: string
  email: string
  age: number
  createdAt?: Date
  updatedAt?: Date
}

export interface CreateUserRequest {
  name: string
  email: string
  age: number
}

export interface UpdateUserRequest {
  name?: string
  email?: string
  age?: number
}