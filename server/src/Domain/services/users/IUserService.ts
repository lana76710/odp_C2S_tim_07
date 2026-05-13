import { UserDto } from "../../DTOs/users/UserDto";

export interface IUserService {
  getAll():                             Promise<UserDto[]>;
  getById(id: number):                  Promise<UserDto | null>;
  searchByGamerTag(query: string):      Promise<UserDto[]>;
  updateProfile(id: number, data: { full_name?: string; profile_image?: string | null }): Promise<boolean>;
  changeRole(id: number, role: string): Promise<boolean>;
}
