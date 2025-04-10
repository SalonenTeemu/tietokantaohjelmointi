import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'aikaPipe', standalone: true })
export class AikaPipe implements PipeTransform {
	// Muotoile aika näytettävämpään muotoon
	transform(sekunnit: number): string {
		const min = Math.floor(sekunnit / 60);
		const sekunti = sekunnit % 60;
		if (min === 0) {
			return `${sekunti} s`;
		} else {
			return `${min} min ${sekunti.toString().padStart(2, '0')} s`;
		}
	}
}
