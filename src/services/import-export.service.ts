import { inject, Injectable } from '@angular/core';
import { collection, deleteDoc, doc, Firestore, getDoc, getDocs, setDoc } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { LevelData, Cell, Platform } from './types';



@Injectable({
    providedIn: 'root',
})
export class JsonImportExportService {
    private firestore: Firestore = inject(Firestore);
    constructor() {}

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

    optimizePlatforms(platforms: Cell[]): Platform[] {
        const sortedPlatforms = platforms.sort((a, b) => a.y - b.y || a.x - b.x);
        const optimizedPlatforms: Platform[] = [];
        let currentPlatform: Platform | null = null;

        for (const platform of sortedPlatforms) {
            if (!currentPlatform || platform.y !== currentPlatform.y || platform.x !== currentPlatform.x + (currentPlatform.width || 1)) {
                if (currentPlatform) {
                    optimizedPlatforms.push(currentPlatform);
                }
                currentPlatform = { ...platform, width: 1 };
            } else {
                currentPlatform.width = (currentPlatform.width || 1) + 1;
            }
        }

        if (currentPlatform) {
            optimizedPlatforms.push(currentPlatform);
        }

        return optimizedPlatforms;
    }

    expandOptimizedPlatforms(platforms: Platform[]): Cell[] {
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
        return from(getDoc(projectRef)).pipe(map((docSnapshot) => (docSnapshot.exists() ? (docSnapshot.data() as LevelData) : null)));
    }

    //getprojectPromise

    getProjectPromise(projectId: string): Promise<LevelData | null> {
        const projectRef = doc(collection(this.firestore, 'projects'), projectId);
        return getDoc(projectRef).then((docSnapshot) => (docSnapshot.exists() ? (docSnapshot.data() as LevelData) : null));
    }

    listProjects(): Observable<string[]> {
        const projectsRef = collection(this.firestore, 'projects');
        return from(getDocs(projectsRef)).pipe(map((snapshot) => snapshot.docs.map((doc) => doc.id)));
    }

    deleteProject(projectId: string): Promise<void> {
        const projectRef = doc(collection(this.firestore, 'projects'), projectId);
        return deleteDoc(projectRef);
    }
}
export { LevelData };

