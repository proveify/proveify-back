import { Controller } from "@nestjs/common";
import { ProviderService } from "@app/provider/provider.service";

@Controller("provider")
export class ProviderController {
    public constructor(private providerService: ProviderService) {}
}
