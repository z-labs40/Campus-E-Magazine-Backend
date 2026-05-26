import { Notification } from "../../adapters/models/Notification";

export interface INotificationRepository {
  create(notification: Partial<Notification>): Promise<Notification>;
  findByUserId(userId: string): Promise<Notification[]>;
  markAsRead(id: string, userId: string): Promise<void>;
}
