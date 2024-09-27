import { Component, signal, computed, ViewChild, ElementRef, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JsonImportExportService } from '../services/import-export.service';
import { ToastrService } from 'ngx-toastr';
import { Cell, LevelData } from '../services/types';


interface Point {
    x: number;
    y: number;
}

type EntityType = 'hero' | 'platform' | 'fire' | 'star' | 'eraser';

@Component({
    selector: 'app-interactive-grid',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="flex">
      <div #gridContainer class="grid-container"
           (mousedown)="handleMouseDown($event)"
           (mouseup)="handleMouseUp($event)"
           (mousemove)="handleMouseMove($event)"
           (mouseleave)="handleMouseLeave()"
           >
        <div class="grilla" 
             [style.width.px]="gridWidth()" 
             [style.height.px]="rows() * cellSize">
          @for (cell of heroCells(); track cell.x + '-' + cell.y) {
            <div class="cell hero" [style.left.px]="cell.x * cellSize" [style.bottom.px]="cell.y * cellSize"></div>
          }
          @for (cell of platformCells(); track cell.x + '-' + cell.y) {
            <div class="cell platform" [style.left.px]="cell.x * cellSize" [style.bottom.px]="cell.y * cellSize"></div>
          }
          @for (cell of fireCells(); track cell.x + '-' + cell.y) {
            <div class="cell fire" [style.left.px]="cell.x * cellSize" [style.bottom.px]="cell.y * cellSize"></div>
          }
          @for (cell of starCells(); track cell.x + '-' + cell.y) {
            <div class="cell star" [style.left.px]="cell.x * cellSize" [style.bottom.px]="cell.y * cellSize"></div>
          }
        </div>
      </div>
      <div class="panel">
      <div class="mb-4">
          <label for="columnsInput" class="block mb-2 font-bold">Columnas: </label>
          <input
            id="columnsInput"
            type="number"
            [ngModel]="columns()"
            (ngModelChange)="updateColumns($event)"
            class="w-full p-2 border border-gray-300 rounded"
          >
        </div>
        <div class="mb-4">
          <h3 class="mb-2 font-bold">Seleccionar entidad:</h3>
          <div class="grid grid-cols-2 gap-2">
            <button (click)="selectEntity('hero')" [class.bg-blue-200]="selectedEntity() === 'hero'" class="p-2 border border-gray-300 rounded hover:bg-blue-100">Héroe</button>
            <button (click)="selectEntity('platform')" [class.bg-blue-200]="selectedEntity() === 'platform'" class="p-2 border border-gray-300 rounded hover:bg-blue-100">Platform</button>
            <button (click)="selectEntity('fire')" [class.bg-blue-200]="selectedEntity() === 'fire'" class="p-2 border border-gray-300 rounded hover:bg-blue-100">Fire</button>
            <button (click)="selectEntity('star')" [class.bg-blue-200]="selectedEntity() === 'star'" class="p-2 border border-gray-300 rounded hover:bg-blue-100">Estrella</button>
            <button (click)="selectEntity('eraser')" [class.bg-blue-200]="selectedEntity() === 'eraser'" class="p-2 border border-gray-300 rounded hover:bg-blue-100">Borrador</button>
          </div>
        </div>
        <div class="mb-4">
          <button (click)="exportJSON()" class="w-full p-2 mb-2 bg-blue-500 text-white rounded hover:bg-blue-600">Exportar JSON</button>
          <input type="file" (change)="importJSON($event)" accept=".json" class="w-full p-2 border border-gray-300 rounded">
        </div>
        <div class="mb-4">
          <input [(ngModel)]="projectName" placeholder="Nombre del proyecto" class="w-full p-2 mb-2 border border-gray-300 rounded">
          <button (click)="saveProject()" class="w-full p-2 mb-2 bg-green-500 text-white rounded hover:bg-green-600">Guardar Proyecto</button>
        </div>
        <div class="mb-4">
          <button (click)="loadProjects()" class="w-full p-2 mb-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">Cargar Proyectos</button>
          <select [(ngModel)]="selectedProject" class="w-full p-2 mb-2 border border-gray-300 rounded" (ngModelChange)="loadProject()">
            <option value="">Seleccionar proyecto</option>
            <!-- <option *ngFor="let project of projects" [value]="project">{{project}}</option> -->
             @for (project of projects; track $index) {
                <option [value]="project">{{project}}</option>  
             }
          </select>
          <button (click)="deleteProject()" [disabled]="!selectedProject" class="w-full p-2 bg-red-500 text-white rounded hover:bg-red-600" [class.opacity-50]="!selectedProject">Eliminar Proyecto</button>
        </div>
      </div>
    </div>
  `,
    styles: [`
    
    .grid-container {
      overflow-x: auto;
      width: calc(100% - 300px);
      border: 1px solid black;
    }
    .grilla {
      position: relative;
      height: 1200px;
      background-color: #ccc;
      background-image: linear-gradient(45deg, #ddd 25%, transparent 25%), 
                        linear-gradient(-45deg, #ddd 25%, transparent 25%), 
                        linear-gradient(45deg, transparent 75%, #ddd 75%), 
                        linear-gradient(-45deg, transparent 75%, #ddd 75%);
      background-size: 120px 120px;
      background-position: 0 0, 0 60px, 60px -60px, -60px 0px;
    }
    .cell {
      position: absolute;
      width: 60px;
      height: 60px;
      box-sizing: border-box;
      pointer-events: none;
    }
    .hero { background-color: blue; }
    .platform { background-color: green; }
    .fire { background-color: red; }
    .star { background-color: yellow; }
    .panel {
      width: 300px;
      padding: 10px;
    }
    button {
      margin: 5px;
      padding: 5px 10px;
    }
    button.selected {
      background-color: #ddd;
    }
  `]
})
export class LevelEditorComponent implements AfterViewInit {
    @ViewChild('gridContainer') gridContainer!: ElementRef;

    columns = signal(100);
    rows = signal(20);
    cellSize = 60;
    heroCells = signal<Cell[]>([]);
    platformCells = signal<Cell[]>([]);
    fireCells = signal<Cell[]>([]);
    starCells = signal<Cell[]>([]);
    isPainting = signal(false);
    mouseDownPosition = signal<Point | null>(null);
    currentPosition = signal<Point | null>(null);
    selectedEntity = signal<EntityType>('platform');

    projectName = '';
    selectedProject = '';
    projects: string[] = [];

    gridWidth = computed(() => this.columns() * this.cellSize);
    private jsonService: JsonImportExportService = inject(JsonImportExportService);
    private toastsService: ToastrService = inject(ToastrService);
    ngAfterViewInit() {
        this.gridContainer.nativeElement.addEventListener('scroll', () => {
            this.heroCells.update(cells => [...cells]);
            this.platformCells.update(cells => [...cells]);
            this.fireCells.update(cells => [...cells]);
            this.starCells.update(cells => [...cells]);
        });
        this.loadProjects();
    }

    handleMouseDown(event: MouseEvent) {
        this.mouseDownPosition.set(this.getMousePosition(event));
        this.currentPosition.set(this.getMousePosition(event));
    }

    handleMouseMove(event: MouseEvent) {
        if (this.mouseDownPosition() === null) return;

        const currentPos = this.getMousePosition(event);
        this.currentPosition.set(currentPos);

        const startPos = this.mouseDownPosition()!;
        const distance = Math.sqrt(
            Math.pow(currentPos.x - startPos.x, 2) +
            Math.pow(currentPos.y - startPos.y, 2)
        );

        if (distance >= 5) {
            this.isPainting.set(true);
            this.paint(event);
        }
    }

    handleMouseUp(event: MouseEvent) {
        if (!this.isPainting()) {
            this.handleClick(event);
        }
        this.resetMouseState();
    }

    handleMouseLeave() {
        this.resetMouseState();
    }

    resetMouseState() {
        this.isPainting.set(false);
        this.mouseDownPosition.set(null);
        this.currentPosition.set(null);
    }

    handleClick(event: MouseEvent) {
        const { x, y } = this.getCellCoordinates(event);
        if (this.isValidCell(x, y)) {
            this.placeEntity(x, y);
        }
    }

    paint(event: MouseEvent) {
        const { x, y } = this.getCellCoordinates(event);
        if (this.isValidCell(x, y)) {
            this.placeEntity(x, y);
        }
    }

    getMousePosition(event: MouseEvent): Point {
        return { x: event.clientX, y: event.clientY };
    }

    getCellCoordinates(event: MouseEvent): { x: number, y: number } {
        const rect = this.gridContainer.nativeElement.getBoundingClientRect();
        const scrollLeft = this.gridContainer.nativeElement.scrollLeft;
        const x = Math.floor((event.clientX - rect.left + scrollLeft) / this.cellSize);
        const y = this.rows() - 1 - Math.floor((event.clientY - rect.top) / this.cellSize);
        return { x, y };
    }

    isValidCell(x: number, y: number): boolean {
        return x >= 0 && x < this.columns() && y >= 0 && y < this.rows();
    }

    placeEntity(x: number, y: number) {
        if (this.selectedEntity() === 'eraser') {
            this.removeEntityAt(x, y);
            return;
        }

        this.removeEntityAt(x, y);

        switch (this.selectedEntity()) {
            case 'hero':
                this.heroCells.set([{ x, y }]);
                break;
            case 'platform':
                this.platformCells.update(cells => [...cells, { x, y }]);
                break;
            case 'fire':
                this.fireCells.update(cells => [...cells, { x, y }]);
                break;
            case 'star':
                this.starCells.update(cells => [...cells, { x, y }]);
                break;
        }
    }

    removeEntityAt(x: number, y: number) {
        this.heroCells.update(cells => cells.filter(cell => cell.x !== x || cell.y !== y));
        this.platformCells.update(cells => cells.filter(cell => cell.x !== x || cell.y !== y));
        this.fireCells.update(cells => cells.filter(cell => cell.x !== x || cell.y !== y));
        this.starCells.update(cells => cells.filter(cell => cell.x !== x || cell.y !== y));
    }

    selectEntity(entity: EntityType) {
        this.selectedEntity.set(entity);
    }

    updateColumns(newColumns: number) {
        this.columns.set(newColumns);
    }

    exportJSON() {
        const levelData: LevelData = {
            name: "New Level",
            platforms: this.jsonService.optimizePlatforms(this.platformCells()),
            hero: this.heroCells()[0] || null,
            fire: this.fireCells(),
            stars: this.starCells(),
            background: "bg_forest"
        };

        const jsonString = this.jsonService.exportJSON(levelData);
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonString);
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "level.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    importJSON(event: Event) {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e: ProgressEvent<FileReader>) => {
                const content = e.target?.result as string;
                try {
                    const levelData = this.jsonService.importJSON(content);
                    this.platformCells.set(this.jsonService.expandOptimizedPlatforms(levelData.platforms));
                    this.heroCells.set(levelData.hero ? [levelData.hero] : []);
                    this.fireCells.set(levelData.fire);
                    this.starCells.set(levelData.stars);

                    const maxX = this.jsonService.getMaxX([
                        ...this.platformCells(),
                        ...this.heroCells(),
                        ...this.fireCells(),
                        ...this.starCells()
                    ]);
                    this.updateColumns(Math.max(maxX + 1, 20));
                } catch (error) {
                    console.error('Error importing JSON:', error);
                }
            };
            reader.readAsText(file);
        }
    }

    saveProject() {
        if (!this.projectName) {
            // alert('Por favor, ingrese un nombre para el proyecto');
            this.toastsService.error('Por favor, ingrese un nombre para el proyecto');
            return;
        }

        const levelData: LevelData = {
            name: this.projectName,
            platforms: this.jsonService.optimizePlatforms(this.platformCells()),
            hero: this.heroCells()[0] || null,
            fire: this.fireCells(),
            stars: this.starCells(),
            background: "bg_forest"
        };

        this.jsonService.saveProject(this.projectName, levelData)
            .then(() => {
                // alert('Proyecto guardado exitosamente');
                this.toastsService.success('Proyecto guardado exitosamente');
                this.loadProjects();
            })
            .catch(error => {
                console.error('Error al guardar el proyecto:', error);
                // alert('Error al guardar el proyecto');
                this.toastsService.error('Error al guardar el proyecto');
            });
    }

    loadProjects() {
        this.jsonService.listProjects().subscribe(projectNames => {
            this.projects = projectNames;
        });
    }

    loadProject() {
        if (!this.selectedProject) return;

        this.jsonService.getProject(this.selectedProject).subscribe(
            levelData => {
                if (levelData) {
                    this.platformCells.set(this.jsonService.expandOptimizedPlatforms(levelData.platforms));
                    this.heroCells.set(levelData.hero ? [levelData.hero] : []);
                    this.fireCells.set(levelData.fire);
                    this.starCells.set(levelData.stars);

                    const maxX = this.jsonService.getMaxX([
                        ...this.platformCells(),
                        ...this.heroCells(),
                        ...this.fireCells(),
                        ...this.starCells()
                    ]);
                    this.updateColumns(Math.max(maxX + 1, 20));
                    // alert('Proyecto cargado exitosamente');
                    this.toastsService.success('Proyecto cargado exitosamente');
                } else {
                    // alert('Proyecto no encontrado');
                    this.toastsService.error('Proyecto no encontrado');
                }
            },
            error => {
                console.error('Error al cargar el proyecto:', error);
                // alert('Error al cargar el proyecto');
                this.toastsService.error('Error al cargar el proyecto');
            }
        );
    }

    deleteProject() {
        if (!this.selectedProject) return;

        if (confirm(`¿Está seguro de que desea eliminar el proyecto "${this.selectedProject}"?`)) {
            this.jsonService.deleteProject(this.selectedProject)
                .then(() => {
                    // alert('Proyecto eliminado exitosamente');
                    this.toastsService.success('Proyecto eliminado exitosamente');
                    this.loadProjects();
                    this.selectedProject = '';
                })
                .catch(error => {
                    console.error('Error al eliminar el proyecto:', error);
                    // alert('Error al eliminar el proyecto');
                    this.toastsService.error('Error al eliminar el proyecto');
                });
        }
    }
}