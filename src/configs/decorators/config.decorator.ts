import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublic";
export const Public = (): PropertyDecorator => SetMetadata(IS_PUBLIC_KEY, true);
