import { Directive, ElementRef, HostListener, Input, OnDestroy, TemplateRef, ViewContainerRef, ComponentRef } from '@angular/core';
import { TooltipService } from './tooltip.service';
import { TooltipComponent } from './tooltip.component';

@Directive({
  selector: '[appTooltip]',
  standalone: true
})
export class TooltipDirective implements OnDestroy {
  @Input('appTooltip') content!: string | TemplateRef<any>;
  @Input() tooltipPosition: 'top' | 'right' | 'bottom' | 'left' = 'top';
  @Input() tooltipOffset = 10;
  @Input() tooltipShowArrow = true;
  @Input() tooltipWidth = 'auto';
  @Input() tooltipMaxWidth = '300px';
  @Input() tooltipShowOnHover = true;
  @Input() tooltipDelay = 300; // Delay in ms before showing tooltip
  
  private tooltipRef: ComponentRef<TooltipComponent> | null = null;
  private showTimeout: any = null;
  
  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private tooltipService: TooltipService,
    private viewContainerRef: ViewContainerRef
  ) {}
  
  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (this.tooltipShowOnHover) {
      this.showTimeout = setTimeout(() => {
        this.show();
      }, this.tooltipDelay);
    }
  }
  
  @HostListener('mouseleave')
  onMouseLeave(): void {
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
    }
    this.hide();
  }
  
  @HostListener('click')
  onClick(): void {
    if (!this.tooltipShowOnHover) {
      this.show();
    }
  }
  
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Hide tooltip when clicking outside (if not hover mode)
    if (!this.tooltipShowOnHover && this.tooltipRef) {
      const clickedInside = this.elementRef.nativeElement.contains(event.target as Node);
      if (!clickedInside) {
        this.hide();
      }
    }
  }
  
  show(): void {
    // Don't show if already visible
    if (this.tooltipRef) return;
    
    this.tooltipRef = this.tooltipService.show(
      this.elementRef.nativeElement,
      {
        position: this.tooltipPosition,
        offset: this.tooltipOffset,
        showArrow: this.tooltipShowArrow,
        width: this.tooltipWidth,
        maxWidth: this.tooltipMaxWidth
      }
    );
    
    // Insert content
    if (this.content instanceof TemplateRef) {
      const viewRef = this.viewContainerRef.createEmbeddedView(this.content);
      const tooltipContentEl = this.tooltipRef.instance.tooltipContainer.nativeElement.querySelector('.tooltip-content');
      
      // Clear any existing content
      tooltipContentEl.innerHTML = '';
      
      // Append each root node from the template
      viewRef.rootNodes.forEach(node => {
        tooltipContentEl.appendChild(node);
      });
    } else if (typeof this.content === 'string') {
      const tooltipContentEl = this.tooltipRef.instance.tooltipContainer.nativeElement.querySelector('.tooltip-content');
      tooltipContentEl.innerHTML = this.content;
    }
    
    // Update position after content is added
    setTimeout(() => {
      if (this.tooltipRef) {
        this.tooltipRef.instance.updatePosition();
      }
    }, 0);
  }
  
  hide(): void {
    if (this.tooltipRef) {
      this.tooltipService.hide(this.tooltipRef);
      this.tooltipRef = null;
    }
  }
  
  ngOnDestroy(): void {
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
    }
    this.hide();
  }
} 