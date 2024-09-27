import { Component, signal, computed, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Cell {
    x: number;
    y: number;
}

interface Point {
    x: number;
    y: number;
}

interface LevelData {
    name: string;
    platforms: Cell[];
    hero: Cell | null;
    fire: Cell[];
    stars: Cell[];
    background: string;
}

type EntityType = 'hero' | 'platform' | 'fire' | 'star' | 'eraser';

@Component({
    selector: 'app-interactive-grid',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="container">
      <div #gridContainer class="grid-container"
           (mousedown)="handleMouseDown($event)"
           (mouseup)="handleMouseUp($event)"
           (mousemove)="handleMouseMove($event)"
           (mouseleave)="handleMouseLeave()"
           >
        <div class="grid" 
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
        <label for="columnsInput">Columnas: </label>
        <input
          id="columnsInput"
          type="number"
          [ngModel]="columns()"
          (ngModelChange)="updateColumns($event)"
        >
        <div>
          <h3>Seleccionar entidad:</h3>
          <button (click)="selectEntity('hero')" [class.selected]="selectedEntity() === 'hero'">Héroe</button>
          <button (click)="selectEntity('platform')" [class.selected]="selectedEntity() === 'platform'">Platform</button>
          <button (click)="selectEntity('fire')" [class.selected]="selectedEntity() === 'fire'">Fire</button>
          <button (click)="selectEntity('star')" [class.selected]="selectedEntity() === 'star'">Estrella</button>
          <button (click)="selectEntity('eraser')" [class.selected]="selectedEntity() === 'eraser'">Borrador</button>
        </div>
        <div>
          <button (click)="exportJSON()">Exportar JSON</button>
          <input type="file" (change)="importJSON($event)" accept=".json">
        </div>
      </div>
    </div>
  `,
    styles: [`
    .container {
      display: flex;
    }
    .grid-container {
      overflow-x: auto;
      width: calc(100% - 200px);
      border: 1px solid black;
    }
    .grid {
      position: relative;
      height: 1200px;
      //create a background tiled 60x60, similar como si estubise transparente
      background-color: #ccc; /* Color de fondo general */
  background-image: linear-gradient(45deg, #ddd 25%, transparent 25%), 
                    linear-gradient(-45deg, #ddd 25%, transparent 25%), 
                    linear-gradient(45deg, transparent 75%, #ddd 75%), 
                    linear-gradient(-45deg, transparent 75%, #ddd 75%);
                    background-size: 120px 120px; /* Tamaño de los cuadrados */
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
      width: 200px;
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
export class InteractiveGridComponent implements AfterViewInit {
    @ViewChild('gridContainer') gridContainer!: ElementRef;

    columns = signal(20);
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

    gridWidth = computed(() => this.columns() * this.cellSize);

    ngAfterViewInit() {
        this.gridContainer.nativeElement.addEventListener('scroll', () => {
            this.heroCells.update(cells => [...cells]);
            this.platformCells.update(cells => [...cells]);
            this.fireCells.update(cells => [...cells]);
            this.starCells.update(cells => [...cells]);
        });
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
            platforms: this.platformCells(),
            hero: this.heroCells()[0] || null,
            fire: this.fireCells(),
            stars: this.starCells(),
            background: "bg_forest"
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(levelData));
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
                    const levelData: LevelData = JSON.parse(content);
                    this.platformCells.set(levelData.platforms);
                    this.heroCells.set(levelData.hero ? [levelData.hero] : []);
                    this.fireCells.set(levelData.fire);
                    this.starCells.set(levelData.stars);
                    // You might want to update other properties like background here
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                }
            };
            reader.readAsText(file);
        }
    }
}