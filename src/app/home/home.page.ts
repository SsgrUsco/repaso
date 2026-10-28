import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonList, IonItem, IonLabel, IonBadge, IonSearchbar,
  IonSelect, IonSelectOption, IonInput, IonButton, 
  IonModal, ToastController, IonGrid, IonRow, IonCol,
  IonAvatar
} from '@ionic/angular';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdersService } from '../services/orders.service';
import { Order } from '../models/order.model';



@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [ IonAvatar, IonGrid, IonRow, IonCol, IonModal, IonButton, IonHeader, IonToolbar, CommonModule, IonInput, CurrencyPipe, FormsModule, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonItem, IonLabel, IonBadge, IonSearchbar, IonSelect, IonSelectOption, IonAvatar],
})
export class HomePage implements OnInit {
  private ordersService = inject(OrdersService);
  private changeDetector = inject(ChangeDetectorRef);
  private toastController = inject(ToastController);

  orders: Order[] = [];
  searchTerm = '';
  selectedStatus = 'Todas';
  minAmount: number | string | null = null;
  maxAmount: number | string | null = null;

  selectedOrder: Order | null = null;

  isInvoiceOpen = false;
  iva = 0;
  total = 0;

  get amountError(): string {
  const min = this.minAmount;
  const max = this.maxAmount;

  if (
    (min !== null && min !== '' && Number(min) < 0) ||
    (max !== null && max !== '' && Number(max) < 0)
  ) {
    return 'Los montos no pueden ser negativos.';
  }

  if (
    min !== null && min !== '' &&
    max !== null && max !== '' &&
    Number(min) > Number(max)
  ) {
    return 'El monto mínimo no puede superar al máximo.';
  }

  return '';
}

 async confirmInvoice(): Promise<void> {
  this.closeInvoice();

  const toast = await this.toastController.create({
    message: 'Factura confirmada correctamente',
    duration: 2500,
    color: 'success',
    position: 'bottom'
  });

  await toast.present();
} 

  openInvoice(order: Order): void {
    this.selectedOrder = order;
    this.iva = order.amount * 0.19;
    this.total = order.amount + this.iva;
    this.isInvoiceOpen = true;
  }

  closeInvoice(): void {
    this.isInvoiceOpen = false;
  }

get filteredOrders(): Order[] {

  if (this.amountError) {
    return [];
  }
  const text = this.searchTerm.toLowerCase().trim();

  return this.orders.filter(order => {
    const matchesText = order.title.toLowerCase().includes(text);
    const matchesStatus =
      this.selectedStatus === 'Todas' || order.status === this.selectedStatus;

    const matchesMin =
      this.minAmount == null || this.minAmount === '' ||
      order.amount >= Number(this.minAmount);

    const matchesMax =
      this.maxAmount == null || this.maxAmount === '' ||
      order.amount <= Number(this.maxAmount);

    return matchesText && matchesStatus && matchesMin && matchesMax;
  });
}
  constructor() {}

  ngOnInit() {
    this.ordersService.getPosts().subscribe({
      next: (posts) => {
        this.orders = posts.slice(0, 20).map((post): Order => ({
          id: post.id,
          title: post.title,
          description: post.body,
          amount: 20000 + post.id * 1000,
          stock: post.id % 8,
          status: post.id %2 === 0 ? 'Completada' : 'Pendiente',
        }));
        console.log('ordenes cargadas', this.orders);
        this.changeDetector.detectChanges();
      },
      error: (error) => console.error('Error al cargar las órdenes', error)
    });
  }
}
