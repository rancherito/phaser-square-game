import { inject, Injectable } from '@angular/core';
import { collection, deleteDoc, doc, Firestore, getDoc, getDocs, setDoc } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';

export interface Cell {
    x: number;
    y: number;
}

interface OptimizedPlatform extends Cell {
    width?: number;
}

export interface LevelData {
    name: string;
    platforms: OptimizedPlatform[];
    hero: Cell | null;
    fire: Cell[];
    stars: Cell[];
    background: string;
}

@Injectable({
    providedIn: 'root'
})
export class JsonImportExportService {
    private firestore: Firestore = inject(Firestore);
    constructor() { }

    exportJSON(levelData: LevelData): string {
        return JSON.stringify(levelData);
    }

    importJSON(jsonString: string): LevelData {
        try {
            const levelData: LevelData = JSON.parse(jsonString);
            return levelData;
        } catch (error) {
            console.error('Error parsing JSON:', error);
            throw new Error('Invalid JSON format');
        }
    }

    optimizePlatforms(platforms: Cell[]): OptimizedPlatform[] {
        const sortedPlatforms = platforms.sort((a, b) => a.y - b.y || a.x - b.x);
        const optimizedPlatforms: OptimizedPlatform[] = [];
        let currentPlatform: OptimizedPlatform | null = null;

        for (const platform of sortedPlatforms) {
            if (!currentPlatform || platform.y !== currentPlatform.y || platform.x !== currentPlatform.x + (currentPlatform.width || 1)) {
                if (currentPlatform) {
                    optimizedPlatforms.push(currentPlatform);
                }
                currentPlatform = { ...platform };
            } else {
                currentPlatform.width = (currentPlatform.width || 1) + 1;
            }
        }

        if (currentPlatform) {
            optimizedPlatforms.push(currentPlatform);
        }

        return optimizedPlatforms;
    }

    expandOptimizedPlatforms(platforms: OptimizedPlatform[]): Cell[] {
        const expandedPlatforms: Cell[] = [];
        for (const platform of platforms) {
            if (platform.width) {
                for (let i = 0; i < platform.width; i++) {
                    expandedPlatforms.push({ x: platform.x + i, y: platform.y });
                }
            } else {
                expandedPlatforms.push(platform);
            }
        }
        return expandedPlatforms;
    }

    getMaxX(cells: Cell[]): number {
        return cells.reduce((max, cell) => Math.max(max, cell.x), 0);
    }


    saveProject(projectId: string, levelData: LevelData): Promise<void> {
        const projectRef = doc(collection(this.firestore, 'projects'), projectId);
        return setDoc(projectRef, levelData);
    }

    getProject(projectId: string): Observable<LevelData | null> {
        const projectRef = doc(collection(this.firestore, 'projects'), projectId);
        return from(getDoc(projectRef)).pipe(
            map(docSnapshot => docSnapshot.exists() ? docSnapshot.data() as LevelData : null)
        );
    }

    listProjects(): Observable<string[]> {
        const projectsRef = collection(this.firestore, 'projects');
        return from(getDocs(projectsRef)).pipe(
            map(snapshot => snapshot.docs.map(doc => doc.id))
        );
    }

    deleteProject(projectId: string): Promise<void> {
        const projectRef = doc(collection(this.firestore, 'projects'), projectId);
        return deleteDoc(projectRef);
    }
}
