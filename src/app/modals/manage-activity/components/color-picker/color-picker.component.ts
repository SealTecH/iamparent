import { Component, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
  selector: 'color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.scss'],
  standalone:true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ColorPickerComponent),
      multi: true
    }
  ]
})
export class ColorPickerComponent implements ControlValueAccessor {
  colorsList: string[] = [
    '#FFB74D', // оранжевый
    '#4DB6AC', // бирюзовый
    '#BA68C8', // фиолетовый
    '#FFD54F', // жёлтый
    '#7986CB', // синий
    '#81C784', // зелёный
    '#E57373', // красный
    '#64B5F6', // голубой
    '#A1887F', // коричневый
    '#90A4AE', // серо-синий
    '#F06292', // розовый
    '#AED581', // салатовый
    '#4FC3F7', // светло-голубой
    '#9575CD', // сиреневый
    '#FF8A65', // коралловый
    '#DCE775', // лайм
    '#F48FB1', // нежно-розовый
    '#CE93D8', // светло-фиолетовый
    '#FFF176', // лимонный
    '#B0BEC5', // стальной
    '#A5D6A7', // мятный
    '#E0E0E0', // светло-серый
    '#FFCC80', // персиковый
    '#B39DDB', // светлый индиго
    '#80DEEA'  // светлая бирюза
  ]
  value: string = '';
  disabled = false;

  onChange = (_: any) => {};
  onTouched = () => {};

  selectColor(icon: string) {
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

