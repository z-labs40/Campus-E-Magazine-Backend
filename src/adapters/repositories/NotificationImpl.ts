import { DataSource, Repository } from "typeorm";
import { Notification } from "../models/Notification";
import { INotificationRepository } from "../../application/interfaces/INotificationRepository";

export class NotificationImpl implements INotificationRepository {
  private repository: Repository<Notification>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(Notification);
  }

  async create(notification: Partial<Notification>): Promise<Notification> {
    const entity = this.repository.create(notification);
    return this.repository.save(entity);
  }

  async findByUserId(userId: string): Promise<Notification[]> {
    return this.repository.find({
      where: { userId },
      order: { createdAt: "DESC" },
      take: 50,
    });
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    await this.repository.update({ id, userId }, { read: true });
  }
}
