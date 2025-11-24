// src/repositories/personRepositoryMemory.ts

import { IPersonRepository } from "./personRepository.js";
import { Person } from "../domain/person.js";

export class PersonRepositoryMemory implements IPersonRepository {
    private persons: Person[] = [];   // vetor em memória

    async create(person: Person): Promise<void> {
        this.persons.push(person);
    }

    async update(person: Person): Promise<void> {
        const index = this.persons.findIndex(p => p.id === person.id);
        if (index >= 0) {
            this.persons[index] = person;
        }
    }

    async delete(id: string): Promise<void> {
        this.persons = this.persons.filter(p => p.id !== id);
    }

    async findById(id: string): Promise<Person | null> {
        return this.persons.find(p => p.id === id) || null;
    }

    async findAll(): Promise<Person[]> {
        return [...this.persons]; // cópia para segurança
    }
}
