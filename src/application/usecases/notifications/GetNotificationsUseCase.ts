import { INotificationRepository } from "../../interfaces/INotificationRepository";

export class GetNotificationsUseCase {
  constructor(private notificationRepository: INotificationRepository) {}

  async execute(userId: string) {
    const notifications =
      await this.notificationRepository.findByUserId(userId);
    return notifications.map((n) => ({
      id: n.id,
      message: n.message,
      type: n.type,
      read: n.read,
      editionId: n.editionId,
      createdAt: n.createdAt,
    }));
  }
}
