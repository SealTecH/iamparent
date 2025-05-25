import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { IonicModule } from "@ionic/angular";
import { IonIcon } from "@ionic/angular/standalone";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
  selector: 'app-icon-picker',
  templateUrl: './icon-picker.component.html',
  styleUrls: ['./icon-picker.component.scss'],
  standalone:true,
  imports:[
    IonIcon
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IconPickerComponent),
      multi: true
    }
  ]
})
export class IconPickerComponent implements ControlValueAccessor {
  iconList: string[] = [
    'analytics-outline',
    'body-outline',
    'pizza-outline',
    'bulb-outline',
    'walk-outline',
    'eye-outline',
    'extension-puzzle-outline',
    'hammer-outline',
    'star-outline',
    'language-outline',
    'sparkles-outline',
    'trophy-outline',
    'moon-outline',
    'heart-outline',
    'desktop-outline',
    'prism-outline'
  ];

  value: string = '';
  disabled = false;

  onChange = (_: any) => {};
  onTouched = () => {};

  selectIcon(icon: string) {
    if (this.disabled) return;
    this.value = icon;
    this.onChange(icon);
    this.onTouched();
  }

  writeValue(icon: string): void {
    this.value = icon;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
