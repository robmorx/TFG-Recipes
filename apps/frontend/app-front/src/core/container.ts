import { Container } from 'inversify';
import { TYPES } from './TYPES';
import { IItemRepository } from '../domain/repositories/IItemRepository';
import { IUserRepository } from '../domain/repositories/IUserRepository';
import { IRecipeRepository } from '../domain/repositories/IRecipeRepository';
import { IItemUseCase } from '../domain/interfaces/IItemUseCase';
import { IUserUseCase } from '../domain/interfaces/IUserUseCase';
import { IRecipeUseCase } from '../domain/interfaces/IRecipeUseCase';
import { ItemRepository } from '../data/repositories/ItemRepository';
import { UserRepository } from '../data/repositories/UserRepository';
import { RecipeRepository } from '../data/repositories/RecipeRepository';
import { ItemUseCase } from '../domain/usecases/ItemUseCase';
import { UserUseCase } from '../domain/usecases/UserUseCase';
import { RecipeUseCase } from '../domain/usecases/RecipeUseCase';

const container = new Container();

container.bind<IItemRepository>(TYPES.IItemRepository).to(ItemRepository);
container.bind<IUserRepository>(TYPES.IUserRepository).to(UserRepository);
container.bind<IRecipeRepository>(TYPES.IRecipeRepository).to(RecipeRepository);

container.bind<IItemUseCase>(TYPES.IItemUseCase).to(ItemUseCase);
container.bind<IUserUseCase>(TYPES.IUserUseCase).to(UserUseCase);
container.bind<IRecipeUseCase>(TYPES.IRecipeUseCase).to(RecipeUseCase);

export { container };
