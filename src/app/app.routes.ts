import { Routes } from '@angular/router';
import { GameComponent } from '../components/game.component';
import { InteractiveGridComponent } from '../components/grid.component';

export const routes: Routes = [
    {
        path: '',
        component: GameComponent
    },
    {
        path: 'test',
        component: InteractiveGridComponent
    }
];
