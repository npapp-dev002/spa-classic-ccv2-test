import { Component, signal } from '@angular/core';
import { StorefrontComponentModule } from "@spartacus/storefront";

@Component({
  selector: 'app-root',
  imports: [StorefrontComponentModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class App {
  protected readonly title = signal('my-spartacus-app-standalone');
}
