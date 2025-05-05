import { ApplicationRef, ComponentRef, createComponent, EnvironmentInjector, Injectable, Type } from '@angular/core';
import { TooltipComponent } from './tooltip.component';

@Injectable({
  providedIn: 'root'
})
export class TooltipService {
  private activeTooltips: ComponentRef<TooltipComponent>[] = [];

  constructor(
    private appRef: ApplicationRef,
    private environmentInjector: EnvironmentInjector
  ) {}

  /**
   * Shows a tooltip at the specified target element
   * @param targetElement The element to attach the tooltip to
   * @param content Content to insert into the tooltip (optional)
   * @param options Configuration options for the tooltip
   * @returns Reference to the created tooltip component
   */
  show(
    targetElement: HTMLElement,
    options: {
      position?: 'top' | 'right' | 'bottom' | 'left';
      offset?: number;
      showArrow?: boolean;
      width?: string;
      maxWidth?: string;
    } = {}
  ): ComponentRef<TooltipComponent> {
    // Create the tooltip component
    const tooltipComponentRef = createComponent(TooltipComponent, {
      environmentInjector: this.environmentInjector,
      hostElement: document.body
    });
    
    // Configure the tooltip
    const tooltipInstance = tooltipComponentRef.instance;
    tooltipInstance.targetElement = targetElement;
    tooltipInstance.position = options.position || 'top';
    tooltipInstance.offset = options.offset !== undefined ? options.offset : 10;
    tooltipInstance.showArrow = options.showArrow !== undefined ? options.showArrow : true;
    tooltipInstance.width = options.width || 'auto';
    tooltipInstance.maxWidth = options.maxWidth || '300px';
    
    // Add to the DOM and show
    this.appRef.attachView(tooltipComponentRef.hostView);
    tooltipInstance.show();
    
    // Keep track of active tooltips
    this.activeTooltips.push(tooltipComponentRef);
    
    return tooltipComponentRef;
  }

  /**
   * Hides and destroys a specific tooltip
   * @param tooltipRef Reference to the tooltip component to hide
   */
  hide(tooltipRef: ComponentRef<TooltipComponent>): void {
    const index = this.activeTooltips.indexOf(tooltipRef);
    
    if (index > -1) {
      const tooltipInstance = tooltipRef.instance;
      tooltipInstance.hide();
      
      // Allow animation to complete before destroying
      setTimeout(() => {
        this.appRef.detachView(tooltipRef.hostView);
        tooltipRef.destroy();
        this.activeTooltips.splice(index, 1);
      }, 200);
    }
  }

  /**
   * Hides all active tooltips
   */
  hideAll(): void {
    // Create a copy of the array to iterate since we'll be modifying it
    const tooltips = [...this.activeTooltips];
    tooltips.forEach(tooltip => this.hide(tooltip));
  }
} 