import { UserStatisticsEntity } from '../entities';

export const USER_STATISTICS_REPOSITORY = 'USER_STATISTICS_REPOSITORY';

export interface IUserStatisticsRepository {
  create(
    userStatistics: Partial<UserStatisticsEntity>,
  ): Promise<UserStatisticsEntity>;

  findById(id: string): Promise<UserStatisticsEntity | null>;

  findByUserId(userId: string): Promise<UserStatisticsEntity | null>;

  update(userStatistics: UserStatisticsEntity): Promise<UserStatisticsEntity>;
}
