import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { IonicModule } from "@ionic/angular";
import { ToastController } from "@ionic/angular/standalone";
import { NgOptimizedImage } from "@angular/common";
import { Directory, Filesystem } from '@capacitor/filesystem';

@Component({
  selector: 'photo-picker',
  templateUrl: './photo-picker.component.html',
  styleUrls: ['./photo-picker.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonicModule,
    NgOptimizedImage
  ],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => PhotoPickerComponent),
    multi: true
  }]
})
export class PhotoPickerComponent implements ControlValueAccessor {
  photos: string[] = [];
  photoData: { loading: boolean, src: string | null  }[] = []

  onChange = (val: string[]) => {};
  onTouched = () => {};

  constructor(private toastCtrl: ToastController, private cdr: ChangeDetectorRef) {}

  async writeValue(value: string[]): Promise<void> {
    this.photos = value || [];
    this.photoData = [];
    await this.checkAllPhotos();
    if(this.photos.length ===value.length){
      this.photos.map(()=>this.photoData.push({src:null, loading: true}));
      for (let i = 0; i < this.photos.length; i++) {
        try {
          const result = await Filesystem.readFile({
            path: this.photos[i].slice(this.photos[i].lastIndexOf('/')),
            directory: Directory.Cache,
          });
          this.photoData[i].src = `data:image/jpeg;base64,${result.data}`;
          this.photoData[i].loading =false;
          this.cdr.detectChanges();
        } catch (e) {
          console.error('Ошибка чтения файла', this.photos[i], e);
        } finally {
          this.photoData[i].loading = false;
        }
      }
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  async addPhoto() {
    const granted = await this.checkPermissions();
    if (!granted) return;

    try {
      const image = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
        quality: 70
      });

      if (image?.path) {
        this.photos.push(image.path);
        const result = await Filesystem.readFile({
          path: image.path.slice(image.path.lastIndexOf('/')),
          directory: Directory.Cache,
        });
        this.photoData.push({src: `data:image/jpeg;base64,${result.data}`,loading: false })
        this.onChange(this.photos);
        this.cdr.detectChanges();
      }
    } catch (err) {
      console.warn('Photo capture cancelled or failed', err);
    }
  }


  removePhoto(index: number) {
    this.photos.splice(index, 1);
    this.onChange(this.photos);
  }

  async checkPermissions(): Promise<boolean> {
    const { camera } = await Camera.checkPermissions();
    if (camera === 'granted') return true;

    const { camera: newStatus } = await Camera.requestPermissions();
    if (newStatus !== 'granted') {
      this.showToast('Camera or gallery access denied');
      return false;
    }

    return true;
  }

  async checkAllPhotos() {
    const promises = this.photos.map(url => this.checkImageExists(url));
    const results = await Promise.all(promises);
    const filtered = this.photos.filter((_, i) => results[i]);

    if (filtered.length !== this.photos.length) {
      this.photos = filtered;
      this.onChange(this.photos);
      this.showToast('Some missing photos were removed');
    }
  }

  private async checkImageExists(path: string): Promise<boolean> {
    try {
      await Filesystem.readFile({
        path: path.slice(path.lastIndexOf('/')),
        directory: Directory.Cache,
      })
      return true;
    } catch {
      return false;
    }
  }

  private async showToast(message: string) {
    const toast = await this.toastCtrl.create({ message, duration: 2000, position: 'bottom' });
    await toast.present();
  }

}
