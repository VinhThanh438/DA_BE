export enum UserType {
    USER = 'user',
    EXPERT = 'expert'
}

export interface ISignup {
    type: UserType,
    email: string,
    fullname: string,
    username: string,
    password: string,
    avatar?: string,
    age?: number,
    description?: string,
    phone_number?: string
}