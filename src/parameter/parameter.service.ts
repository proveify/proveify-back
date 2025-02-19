import { Injectable } from "@nestjs/common";
import { ParameterType } from "./interfaces/interfaces";

import * as UserTypes from "./parameters/users_types.json";
import * as IdentificationTypes from "./parameters/identification_types.json";

@Injectable()
export class ParameterService {
    public getUserTypeByKey(key: string): ParameterType | undefined {
        const types = UserTypes as ParameterType[];
        return types.find((type: ParameterType) => type.key === key);
    }

    public getAllUserTypes(): ParameterType[] {
        return UserTypes as ParameterType[];
    }

    public getAllIdentificationTypes(): ParameterType[] {
        return IdentificationTypes as ParameterType[];
    }

    public getIdentificationTypeById(id: number): ParameterType | undefined {
        const types = IdentificationTypes as ParameterType[];
        return types.find((type: ParameterType) => type.id === id);
    }

    public getIdentificationTypeByKey(key: string): ParameterType | undefined {
        const types = IdentificationTypes as ParameterType[];
        return types.find((type: ParameterType) => type.key === key);
    }
}
