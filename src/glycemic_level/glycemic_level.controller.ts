import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { RegisterLevelDTO } from "./dto/register_level.dto";
import { RegisterLevelEntity } from "./entity/register_level.entity";
import { v4 as uuid} from 'uuid';
import { GlycemicLevelRepository } from "./repository/glycemic_level.repository";
import { TYPE_LEVEL } from "./enum/glycemic_level.enum";
import { UpdateRegisterLevelDTO } from "./dto/update_register_level.dto";
import { GlycemicLevelService } from "./glycemic_level.service";

@Controller('glicemic-level')
export class GlycemicController {

    constructor(public glycemicLevelRepository: GlycemicLevelRepository, public glycemicLevelService: GlycemicLevelService){}

    @Get('/:id')
    public async getGlycemicRate(@Param('id') id: string): Promise<RegisterLevelEntity> {
        return await this.glycemicLevelRepository.getById(id);
    }

    @Get()
    public async getAllGlycemicRegister(): Promise<Array<RegisterLevelEntity>> {
        return await this.glycemicLevelRepository.getAllRegister();
    }

    @Post()
    public async registerLevel(@Body() registerDataRequest: RegisterLevelDTO): Promise<Object> {
        const registerLevelEntity = new RegisterLevelEntity();
        registerLevelEntity.level = registerDataRequest.level;

        if (registerDataRequest.registerDate) {
            registerLevelEntity.registerDate = registerDataRequest.registerDate.toString();
        } else {
            const today = new Date();
            registerLevelEntity.registerDate = `${today.getDate()}/${(today.getMonth() + 1)}/${today.getFullYear()}`
        }
        
        if (registerDataRequest.type) {
            registerLevelEntity.type = registerDataRequest.type;
        } else {
            registerLevelEntity.type = TYPE_LEVEL.RANDOM;
        }

        const glycemicLevel = this.glycemicLevelService.setGlycemitRate(registerLevelEntity.level, registerLevelEntity.type);

        registerLevelEntity.rate = glycemicLevel.rate;
        registerLevelEntity.rateColor = glycemicLevel.rateColor;
        registerLevelEntity.id = uuid();

        this.glycemicLevelRepository.save(registerLevelEntity);

        return {
            id: registerLevelEntity.id,
            message: 'O nível de glicose foi registrado com sucesso!'
        };

    }

    @Put('/:id')
    public async updateGlycemicRegister(@Param('id') id: string, @Body() dataToUpdate: UpdateRegisterLevelDTO): Promise<Object> {

        const registerToUpdate = await this.glycemicLevelRepository.getById(id);

        const glycemicLevel = this.glycemicLevelService.setGlycemitRate(dataToUpdate.level, dataToUpdate.type);

        dataToUpdate.rate = glycemicLevel.rate;
        dataToUpdate.rateColor = glycemicLevel.rateColor;

        const registerUpToDate = await this.glycemicLevelRepository.update(registerToUpdate, dataToUpdate);

        return {
            register: registerUpToDate,
            message: 'Registro atualizado com sucesso!'
        }
    }

    @Delete('/:id')
    public async deleteGlycemicRegister(@Param('id') id: string) {
        await this.glycemicLevelRepository.delete(id);

        return {
            message: 'O nível de glicose foi excluído com sucesso!'
        };
    }
}