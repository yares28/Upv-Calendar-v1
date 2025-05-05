import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, HostListener, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss'],
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('tooltipAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'scale(0.9)' }))
      ])
    ])
  ]
})
export class TooltipComponent implements OnInit, OnDestroy {
  @Input() targetElement: HTMLElement | null = null;
  @Input() position: 'top' | 'right' | 'bottom' | 'left' = 'top';
  @Input() offset = 10; // Distance from target element
  @Input() showArrow = true;
  @Input() width = 'auto';
  @Input() maxWidth = '300px';

  @ViewChild('tooltipContainer') tooltipContainer!: ElementRef;

  public tooltipStyles: any = {};
  public arrowStyles: any = {};
  public isVisible = false;
  public isMobile = false;

  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.checkMobileView();
    this.updatePosition();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.checkMobileView();
    this.updatePosition();
  }

  checkMobileView(): void {
    this.isMobile = window.innerWidth < 768;
    this.cd.markForCheck();
  }

  show(): void {
    this.isVisible = true;
    this.cd.markForCheck();
    // Update position on next tick to ensure DOM is updated
    setTimeout(() => this.updatePosition(), 0);
  }

  hide(): void {
    this.isVisible = false;
    this.cd.markForCheck();
  }

  updatePosition(): void {
    if (!this.targetElement || !this.isVisible || !this.tooltipContainer) return;

    const targetRect = this.targetElement.getBoundingClientRect();
    const tooltipRect = this.tooltipContainer.nativeElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Initial position calculation
    let top = 0;
    let left = 0;
    let transformOrigin = '';

    // Position based on specified direction
    switch (this.position) {
      case 'top':
        top = targetRect.top - tooltipRect.height - this.offset;
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
        transformOrigin = 'bottom center';
        break;
      case 'right':
        top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
        left = targetRect.right + this.offset;
        transformOrigin = 'left center';
        break;
      case 'bottom':
        top = targetRect.bottom + this.offset;
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
        transformOrigin = 'top center';
        break;
      case 'left':
        top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
        left = targetRect.left - tooltipRect.width - this.offset;
        transformOrigin = 'right center';
        break;
    }

    // Adjust for viewport boundaries
    if (left < 10) {
      left = 10;
    } else if (left + tooltipRect.width > viewportWidth - 10) {
      left = viewportWidth - tooltipRect.width - 10;
    }

    if (top < 10) {
      top = 10;
    } else if (top + tooltipRect.height > viewportHeight - 10) {
      top = viewportHeight - tooltipRect.height - 10;
    }

    // Set tooltip position style
    this.tooltipStyles = {
      top: `${top}px`,
      left: `${left}px`,
      width: this.width,
      maxWidth: this.maxWidth,
      transformOrigin
    };

    // Calculate arrow position if enabled
    if (this.showArrow && !this.isMobile) {
      const arrowPosition = this.calculateArrowPosition(targetRect, { top, left, width: tooltipRect.width, height: tooltipRect.height });
      this.arrowStyles = arrowPosition;
    }

    this.cd.markForCheck();
  }

  private calculateArrowPosition(targetRect: DOMRect, tooltipRect: { top: number, left: number, width: number, height: number }): any {
    const arrowSize = 10; // Size of the arrow in pixels
    let arrowStyles = {};

    switch (this.position) {
      case 'top':
        arrowStyles = {
          bottom: `-${arrowSize - 1}px`,
          left: `${targetRect.left + targetRect.width / 2 - tooltipRect.left}px`,
          transform: 'rotate(45deg)'
        };
        break;
      case 'right':
        arrowStyles = {
          left: `-${arrowSize - 1}px`,
          top: `${targetRect.top + targetRect.height / 2 - tooltipRect.top}px`,
          transform: 'rotate(-45deg)'
        };
        break;
      case 'bottom':
        arrowStyles = {
          top: `-${arrowSize - 1}px`,
          left: `${targetRect.left + targetRect.width / 2 - tooltipRect.left}px`,
          transform: 'rotate(45deg)'
        };
        break;
      case 'left':
        arrowStyles = {
          right: `-${arrowSize - 1}px`,
          top: `${targetRect.top + targetRect.height / 2 - tooltipRect.top}px`,
          transform: 'rotate(-45deg)'
        };
        break;
    }

    return arrowStyles;
  }
} 