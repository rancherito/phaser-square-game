import { Routes } from '@angular/router';
import { GameComponent } from '../components/game.component';
import { LevelEditorComponent } from '../components/level-editor.component';
import { WelcomeComponent } from '../components/welcome.component';

export const routes: Routes = [
    {
        path: '',
        component: WelcomeComponent
    },
    {
        path: 'test',
        component: LevelEditorComponent
    },
    {
        path: 'game',
        component: GameComponent
    }
];
