import knex from "../db/knex.db";

class TriviaFacade {
  constructor() {}

  async loadTriviaRoomsFromDb() {
    try {
      const rooms = await this.retrieveRooms();

      rooms.map(async (room) => {
        const roomStartTime = room.createdAt;
        const roundDuration = room.roundDuration;

        const currentTime = new Date().getTime();
        const roundEndTime = new Date(roomStartTime).getTime() + (roundDuration * 1000);
        const timeRemaining = roundEndTime - currentTime;
        const roomId = room.roomId;

        if (timeRemaining <= 0) {
          console.log(`[loadTriviaRoomsFromDb] Deleting room ${roomId} due to inactivity or expiration`);
          await this.endRoom(roomId);
        } else {
          await this.scheduleRoomEnd(roomId, timeRemaining);
        }
      });
    } catch (error) {
      console.log("[loadTriviaRoomsFromDb] Error while loading existing rooms:", error);
    }
  }

  async scheduleRoomEnd(roomId: string, roundDuration: number) {
    console.log(`[scheduleRoomEnd] Scheduling room end for room ${roomId} for duration ${roundDuration / 1000}s`);

    setTimeout(async () => {
      await this.endRoom(roomId);
    }, roundDuration);
  }

  async endRoom(roomId: string) {
    await knex.transaction(async (trx) => {
      await trx("trivia_rooms")
        .where({ room_id: roomId })
        .del();
    
      await trx("trivia_room_users")
        .where({ room_id: roomId })
        .del();
    })
  }

  async retrieveRooms() {
    const rooms = await knex("trivia_rooms").select();
    return rooms.map((room: any) => ({
      roomId: room.room_id,
      questionBankId: room.question_bank_id,
      roundDuration: room.round_duration,
      createdAt: room.created_at,
    }));
  }
}

const triviaFacade = new TriviaFacade();
export default triviaFacade;
