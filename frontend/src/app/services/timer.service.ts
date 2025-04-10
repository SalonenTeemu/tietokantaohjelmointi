import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TimerService {
	private aikaLaskuri = new BehaviorSubject<number>(0);
	private maxAika = 300; // 5 minuuttia
	private intervalSub?: Subscription;

	getCountdown() {
		return this.aikaLaskuri.asObservable();
	}

	start() {
		this.stop();
		this.aikaLaskuri.next(this.maxAika);

		this.intervalSub = interval(1000).subscribe(() => {
			const current = this.aikaLaskuri.getValue();
			if (current > 0) {
				this.aikaLaskuri.next(current - 1);
			} else {
				this.stop();
			}
		});
	}

	reset() {
		this.start();
	}

	stop() {
		this.intervalSub?.unsubscribe();
		this.intervalSub = undefined;
	}

	clear() {
		this.stop();
		this.aikaLaskuri.next(0);
	}
}
