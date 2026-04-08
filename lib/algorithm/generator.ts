export interface Assignment {
  _id: string;
  teacherId: { _id: string; name: string };
  subjectId: { _id: string; name: string; type: string };
  classId: { _id: string; name: string; section: string };
  periodsPerWeek: number;
}

export interface Constraint {
  teacherId: string;
  day: string;
  periodIndex?: number | null;
}

export interface Slot {
  day: string;
  periodIndex: number;
}

export interface TimetableEntry {
  day: string;
  periodIndex: number;
  classId: string;
  subjectId: string;
  teacherId: string;
  roomId?: string;
  type?: string;
}

export class TimetableGenerator {
  private assignments: Assignment[];
  private constraints: Constraint[];
  private availableSlots: Slot[];
  private rooms: any[];
  
  private grid: Map<string, TimetableEntry> = new Map(); // Key: day-period-class
  private teacherBusy: Set<string> = new Set(); // Key: day-period-teacher
  private roomBusy: Set<string> = new Set(); // Key: day-period-room

  constructor(assignments: Assignment[], constraints: Constraint[], slots: Slot[], rooms: any[]) {
    this.assignments = assignments;
    this.constraints = constraints;
    this.availableSlots = slots;
    this.rooms = rooms;
  }

  public generate(): TimetableEntry[] | null {
    // 1. Flatten assignments into individual periods
    let flattened: any[] = [];
    this.assignments.forEach(asm => {
      for (let i = 0; i < asm.periodsPerWeek; i++) {
        flattened.push({ ...asm });
      }
    });

    // 2. Sort by difficulty (assignments with teachers who have more constraints first)
    // For now, just a basic shuffle to get variations
    this.shuffle(flattened);

    if (this.solve(flattened, 0)) {
      return Array.from(this.grid.values());
    }

    return null;
  }

  private solve(flatAssignments: any[], index: number): boolean {
    if (index >= flatAssignments.length) return true;

    const current = flatAssignments[index];
    
    // Shuffle available slots to get different results each time
    const slots = [...this.availableSlots];
    this.shuffle(slots);

    for (const slot of slots) {
      if (this.isSafe(current, slot)) {
        // Find an available room
        const room = this.findAvailableRoom(current, slot);
        if (!room && current.subjectId.type === "LAB") continue; // Labs MUST have a room if specified

        this.place(current, slot, room?._id);
        if (this.solve(flatAssignments, index + 1)) return true;
        this.unplace(current, slot, room?._id);
      }
    }

    return false;
  }

  private isSafe(asm: any, slot: Slot): boolean {
    const slotKey = `${slot.day}-${slot.periodIndex}`;
    const gridKey = `${slotKey}-${asm.classId._id}`;
    const teacherKey = `${slotKey}-${asm.teacherId._id}`;

    // 1. Class is busy?
    if (this.grid.has(gridKey)) return false;

    // 2. Teacher is busy?
    if (this.teacherBusy.has(teacherKey)) return false;

    // 3. Teacher is constrained?
    const isConstrained = this.constraints.some(c => 
      c.teacherId === asm.teacherId._id && 
      c.day === slot.day && 
      (c.periodIndex === null || c.periodIndex === undefined || c.periodIndex === slot.periodIndex)
    );
    if (isConstrained) return false;

    return true;
  }

  private findAvailableRoom(asm: any, slot: Slot): any | null {
    const slotKey = `${slot.day}-${slot.periodIndex}`;
    
    // Priority: Lab subjects must use Lab rooms
    const suitableRooms = this.rooms.filter(r => 
        asm.subjectId.type === "LAB" ? r.type === "LAB" : r.type === "CLASSROOM"
    );

    for (const room of suitableRooms) {
      const roomKey = `${slotKey}-${room._id}`;
      if (!this.roomBusy.has(roomKey)) return room;
    }

    return null;
  }

  private place(asm: any, slot: Slot, roomId?: string) {
    const slotKey = `${slot.day}-${slot.periodIndex}`;
    const gridKey = `${slotKey}-${asm.classId._id}`;
    const teacherKey = `${slotKey}-${asm.teacherId._id}`;

    this.grid.set(gridKey, {
      day: slot.day,
      periodIndex: slot.periodIndex,
      classId: asm.classId._id,
      subjectId: asm.subjectId._id,
      teacherId: asm.teacherId._id,
      roomId,
      type: asm.subjectId.type,
    });

    this.teacherBusy.add(teacherKey);
    if (roomId) this.roomBusy.add(`${slotKey}-${roomId}`);
  }

  private unplace(asm: any, slot: Slot, roomId?: string) {
    const slotKey = `${slot.day}-${slot.periodIndex}`;
    const gridKey = `${slotKey}-${asm.classId._id}`;
    const teacherKey = `${slotKey}-${asm.teacherId._id}`;

    this.grid.delete(gridKey);
    this.teacherBusy.delete(teacherKey);
    if (roomId) this.roomBusy.delete(`${slotKey}-${roomId}`);
  }

  private shuffle(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}
