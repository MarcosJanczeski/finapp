// src/repositories/personRepository.ts

import { Person } from "../domain/person.js";

// Interface do repositório de pessoas
export interface IPersonRepository {
    create(person: Person): Promise<void>;
    update(person: Person): Promise<void>;
    delete(id: string): Promise<void>;
    findById(id: string): Promise<Person | null>;
    findAll(): Promise<Person[]>;
}
