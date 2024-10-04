import { IsNotEmpty, IsString } from 'class-validator';

export class MessageDataDto {
  @IsString({ message: 'Text must be a string' })
  @IsNotEmpty({ message: 'Text is needed for the message' })
  text: string;

  @IsString({ message: 'Current user ID must be a string' })
  @IsNotEmpty({ message: 'Current user ID is required' })
  currentUserId: string;

  @IsString({ message: 'Chat ID must be a string' })
  @IsNotEmpty({ message: 'Chat ID is required' })
  chatId: string;
}
