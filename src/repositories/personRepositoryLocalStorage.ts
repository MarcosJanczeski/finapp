// src/repositories/personRepositoryLocalStorage.ts

import { IPersonRepository } from "./personRepository.js";
import { Person } from "../domain/person.js";

export class PersonRepositoryLocalStorage implements IPersonRepository {

    private storageKey = "finapp_persons";

    private load(): Person[] {
        const data = localStorage.getItem(this.storageKey);
        if (!data) return [];
        try {
            return JSON.parse(data);
        } catch {
            return [];
        }
    }

    private save(persons: Person[]): void {
        localStorage.setItem(this.storageKey, JSON.stringify(persons));
    }

    async create(person: Person): Promise<void> {
        const persons = this.load();
        persons.push(person);
        this.save(persons);
    }

    async update(person: Person): Promise<void> {
        const persons = this.load();
        const index = persons.findIndex(p => p.id === person.id);
        if (index >= 0) {
            persons[index] = person;
            this.save(persons);
        }
    }

    async delete(id: string): Promise<void> {
        const persons = this.load().filter(p => p.id !== id);
        this.save(persons);
    }

    async findById(id: string): Promise<Person | null> {
        return this.load().find(p => p.id === id) || null;
    }

    async findAll(): Promise<Person[]> {
        return this.load();
    }
}
