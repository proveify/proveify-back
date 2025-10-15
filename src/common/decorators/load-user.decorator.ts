import { type CustomDecorator, SetMetadata } from "@nestjs/common";

export const LOAD_USER_KEY = "LOAD_USER";
export const LoadUser = (): CustomDecorator => SetMetadata(LOAD_USER_KEY, true);
