import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'aikaPipe', standalone: true })
export class AikaPipe implements PipeTransform {
	transform(sekunnit: number): string {
		const min = Math.floor(sekunnit / 60);
		const sekunti = sekunnit % 60;
		return `${min} min ${sekunti.toString().padStart(2, '0')} s`;
	}
}
