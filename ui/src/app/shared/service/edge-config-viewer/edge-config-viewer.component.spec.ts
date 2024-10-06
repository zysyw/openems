import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EdgeConfigViewerComponent } from './edge-config-viewer.component';

describe('EdgeConfigViewerComponent', () => {
  let component: EdgeConfigViewerComponent;
  let fixture: ComponentFixture<EdgeConfigViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EdgeConfigViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EdgeConfigViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
