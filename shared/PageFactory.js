import { DashboardPage } from '../pages/DashboardPage.js';
import { KanbanPage } from '../pages/KanbanPage.js';

/**
 * Page Factory for creating page objects
 * Used when not using LoginManager
 */
export class PageFactory {
    static createPages(page) {
        return {
            dashboardPage: new DashboardPage(page),
            kanbanPage: new KanbanPage(page)
        };
    }
}
