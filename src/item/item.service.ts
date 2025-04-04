import { PrismaService } from "@app/prisma/prisma.service";
import { HttpException, Injectable } from "@nestjs/common";
import { Prisma, Items as ItemModel, Files as FileModel } from "@prisma/client";
import { ItemCreateDto, ItemUpdateDto } from "./dto/item.dto";
import { AuthContextService } from "@app/auth/auth-context.service";
import { FileService } from "@app/file/file.service";
import { ResourceType } from "@app/file/interfaces/file-manager.interface";
import { MemoryStoredFile } from "nestjs-form-data";

@Injectable()
export class ItemService {
    public constructor(
        private prisma: PrismaService,
        private authContextService: AuthContextService,
        private fileService: FileService,
    ) {}

    public async prepareCreate(data: ItemCreateDto): Promise<Prisma.ItemsCreateInput> {
        const provider = this.authContextService.getProvider();

        if (!provider) {
            throw new HttpException("User not has provider", 400);
        }

        const item: Prisma.ItemsCreateInput = {
            name: data.name,
            description: data.description,
            price: data.price,
            provider: { connect: { id: provider.id } },
        };

        if (data.image) {
            const image = await this.uploadImage(data.image);
            item.image = image.id;
        }

        return item;
    }

    public async prepareUpdate(data: ItemUpdateDto, id: string): Promise<Prisma.ItemsUpdateInput> {
        const provider = this.authContextService.getProvider();
        const item = await this.findItemById(id);

        if (!item) {
            throw new HttpException("Item not found", 404);
        }

        if (!provider) {
            throw new HttpException("User not has provider", 400);
        }

        const itemUpdateInput: Prisma.ItemsUpdateInput = {
            name: data.name,
            description: data.description,
            price: data.price,
        };

        if (data.image && item.image) {
            const image = await this.uploadImage(data.image, item.image);
            itemUpdateInput.image = image.id;
        } else if (data.image) {
            const image = await this.uploadImage(data.image);
            itemUpdateInput.image = image.id;
        }

        return itemUpdateInput;
    }

    public async createItem(item: Prisma.ItemsCreateInput): Promise<ItemModel> {
        return this.prisma.items.create({ data: item });
    }

    public async updateItem(item: Prisma.ItemsUpdateInput, id: string): Promise<ItemModel> {
        return this.prisma.items.update({ where: { id }, data: item });
    }

    public async findItemById(id: string): Promise<ItemModel | null> {
        return this.prisma.items.findUnique({ where: { id } });
    }

    private async uploadImage(image: MemoryStoredFile, fileId?: string): Promise<FileModel> {
        /**
         * Si existe un fileId, entonces hay que actualizar la imagen
         */
        if (fileId) {
            const file = await this.fileService.getFileById(fileId);

            if (file) {
                const fileUpdated = await this.fileService.update(file, image);

                return fileUpdated.file;
            }
        }

        const file = await this.fileService.save(image, ResourceType.ITEM_IMAGE);

        return file;
    }
}
