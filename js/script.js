const companyLogoBase64 = 'kod64';

document.addEventListener('DOMContentLoaded', function() {
    const loginContainer = document.getElementById('loginContainer');
    const calculatorContainer = document.getElementById('calculatorContainer');
    const loginBtn = document.getElementById('loginBtn');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('loginError');

    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            const username = usernameInput.value;
            const password = passwordInput.value;

            if (username === CONFIG.AUTH.USERNAME && password === CONFIG.AUTH.PASSWORD) {
                loginContainer.classList.add('hidden');
                calculatorContainer.classList.remove('hidden');
                initializeCalculator(); // Initialize calculator after successful login
            } else {
                loginError.style.display = 'block';
            }
        });
    }


    function initializeCalculator() {
        const elements = {
            companyNameInput: document.getElementById('companyName'),
            taxFormSelect: document.getElementById('taxForm'),
            taxRateSelect: document.getElementById('taxRate'),
            calculateBtn: document.getElementById('calculate'),
            toggleScheduleBtn: document.getElementById('toggleSchedule'),
            scheduleContainer: document.getElementById('scheduleContainer'),
            resultsDiv: document.getElementById('results'),
            showCalculationsBtn: document.getElementById('showCalculations'),
            calculationDetails: document.getElementById('calculationDetails'),
            displayedInterestRate: document.getElementById('displayedInterestRate'),
            calculationStep: document.getElementById('calculationStep'),
            downloadPdfBtn: document.getElementById('downloadPdf'),
            exportCSVBtn: document.getElementById('exportCSV')
        };

        Object.entries(elements).forEach(([key, element]) => {
            if (element) {
                switch (key) {
                    case 'taxFormSelect':
                        element.addEventListener('change', function() {
                            const taxForm = this.value;
                            if (elements.taxRateSelect) {
                                elements.taxRateSelect.innerHTML = '';
                                if (taxForm === 'ryczalt') {
                                    elements.taxRateSelect.innerHTML = `
                                        <option value="8.5">8,5%</option>
                                        <option value="12.5">12,5%</option>
                                    `;
                                } else if (taxForm === 'liniowy') {
                                    elements.taxRateSelect.innerHTML = `
                                        <option value="9">9%</option>
                                        <option value="19">19%</option>
                                    `;
                                }
                            } else {
                                console.error('Element taxRateSelect is null');
                                alert('Błąd: Element stawki podatku nie został znaleziony. Odśwież stronę lub skontaktuj się z administratorem.');
                            }
                            calculateInterestRate();
                        });
                        break;
                    case 'toggleScheduleBtn':
                        element.addEventListener('click', function() {
                            this.classList.toggle('open');
                            if (elements.scheduleContainer) {
                                elements.scheduleContainer.classList.toggle('open');
                            } else {
                                console.error('Element scheduleContainer is null');
                                alert('Błąd: Kontener harmonogramu nie został znaleziony. Odśwież stronę.');
                            }
                            if (this.classList.contains('open')) {
                                this.textContent = 'Ukryj harmonogram wypłat';
                            } else {
                                this.textContent = 'Pokaż harmonogram wypłat';
                            }
                        });
                        break;
                    case 'showCalculationsBtn':
                        element.addEventListener('click', function() {
                            const calculationDetails = elements.calculationDetails;
                            
                            if (!calculationDetails) {
                                console.error('Element calculationDetails is null');
                                alert('Błąd: Sekcja obliczeń nie została znaleziona. Odśwież stronę.');
                                return;
                            }

                            // Przełącz klasę dla animacji strzałki
                            this.classList.toggle('open');

                            // Sprawdź czy sekcja jest już widoczna
                            const isCurrentlyVisible = calculationDetails.style.display === 'block';
                            
                            if (isCurrentlyVisible) {
                                // Ukryj obliczenia
                                calculationDetails.style.display = 'none';
                                this.textContent = 'Pokaż obliczenia';
                            } else {
                                // Pokaż obliczenia - wykonaj wszystkie obliczenia
                                const baseInterestRateElement = document.getElementById('baseInterestRate');
                                const monthsElement = document.getElementById('months');
                                const capitalElement = document.getElementById('capital');
                                const finalPaymentElement = document.getElementById('finalPayment');
                                const settlementElement = document.getElementById('settlement');
                                const taxFormElement = document.getElementById('taxForm');

                                if (!baseInterestRateElement || !monthsElement || !capitalElement || !finalPaymentElement || !settlementElement || !taxFormElement) {
                                    console.error('One or more input elements are null:', {
                                        baseInterestRate: baseInterestRateElement,
                                        months: monthsElement,
                                        capital: capitalElement,
                                        finalPayment: finalPaymentElement,
                                        settlement: settlementElement,
                                        taxForm: taxFormElement
                                    });
                                    alert('Błąd: Jedno lub więcej pól formularza (np. forma opodatkowania) nie zostało znalezione. Sprawdź formularz lub odśwież stronę.');
                                    return;
                                }

                                const baseInterestRate = parseFloat(baseInterestRateElement.value) || 0;
                                const months = parseInt(monthsElement.value) || 12;
                                const capital = parseFloat(capitalElement.value) || 0;
                                const settlement = settlementElement.value;
                                const taxForm = taxFormElement.value;
                                
                                let freq, multiplierFreq;
                                switch (settlement) {
                                    case 'monthly':
                                        freq = 1;
                                        multiplierFreq = 0.9210;
                                        break;
                                    case 'quarterly':
                                        freq = 3;
                                        multiplierFreq = 0.9445;
                                        break;
                                    case 'semiannual':
                                        freq = 6;
                                        multiplierFreq = 0.9810;
                                        break;
                                    case 'annual':
                                        freq = 12;
                                        multiplierFreq = 1.0425;
                                        break;
                                    default:
                                        freq = 12;
                                        multiplierFreq = 1.0425;
                                }
                                
                                let multiplierMonths;
                                switch (months) {
                                    case 12:
                                        multiplierMonths = 0.9700;
                                        break;
                                    case 18:
                                        multiplierMonths = 0.9800;
                                        break;
                                    case 24:
                                        multiplierMonths = 0.9900;
                                        break;
                                    case 30:
                                        multiplierMonths = 1.0500;
                                        break;
                                    case 36:
                                        multiplierMonths = 1.0850;
                                        break;
                                    case 48:
                                        multiplierMonths = 1.1520;
                                        break;
                                    default:
                                        multiplierMonths = 1.0;
                                }
                                
                                let multiplierCapital;
                                if (capital >= 10000 && capital <= 29999) {
                                    multiplierCapital = 1.0000;
                                } else if (capital >= 30000 && capital <= 49999) {
                                    multiplierCapital = 1.0655;
                                } else if (capital >= 50000 && capital <= 99999) {
                                    multiplierCapital = 1.0655;
                                } else if (capital >= 100000 && capital <= 199999) {
                                    multiplierCapital = 1.0990;
                                } else if (capital >= 200000 && capital <= 999999) {
                                    multiplierCapital = 1.1880;
                                } else if (capital >= 1000000 && capital <= 9999999) {
                                    multiplierCapital = 1.1880;
                                } else {
                                    multiplierCapital = 1.0000;
                                }
                                
                                let finalPaymentPercent;
                                switch (months) {
                                    case 12:
                                        finalPaymentPercent = taxForm === 'liniowy' ? 75.0 : 100.0;
                                        break;
                                    case 18:
                                        finalPaymentPercent = taxForm === 'liniowy' ? 62.5 : 90.0;
                                        break;
                                    case 24:
                                        finalPaymentPercent = taxForm === 'liniowy' ? 50.0 : 80.0;
                                        break;
                                    case 30:
                                        finalPaymentPercent = taxForm === 'liniowy' ? 37.5 : 70.0;
                                        break;
                                    case 36:
                                        finalPaymentPercent = taxForm === 'liniowy' ? 25.0 : 60.0;
                                        break;
                                    case 48:
                                        finalPaymentPercent = taxForm === 'liniowy' ? 0.0 : 40.0;
                                        break;
                                    default:
                                        finalPaymentPercent = taxForm === 'liniowy' ? 25.0 : 60.0;
                                }
                                
                                finalPaymentElement.value = finalPaymentPercent;
                                
                                const multiplierFinalPayment = 1;
                                
                                const interestRate = baseInterestRate * multiplierMonths * multiplierCapital * multiplierFinalPayment * multiplierFreq;
                                
                                if (elements.calculationStep) {
                                    elements.calculationStep.textContent = `
                                        Bazowa stopa: ${baseInterestRate}%
                                        × Mnożnik okresu: ${multiplierMonths.toFixed(8)}
                                        × Mnożnik kapitału: ${multiplierCapital.toFixed(8)}
                                        × Mnożnik procentu spłaty: ${multiplierFinalPayment}
                                        × Mnożnik częstotliwości: ${multiplierFreq.toFixed(8)}
                                        = Stopa procentowa: ${interestRate.toFixed(8)}%
                                    `;
                                }
                                
                                calculationDetails.style.display = 'block';
                                this.textContent = 'Ukryj obliczenia';
                            }
                        });
                        break;
                    case 'calculateBtn':
                        element.addEventListener('click', function() {
                            const transferDateElement = document.getElementById('transferDate');
                            const capitalElement = document.getElementById('capital');
                            const monthsElement = document.getElementById('months');
                            const settlementElement = document.getElementById('settlement');
                            const finalPaymentElement = document.getElementById('finalPayment');
                            const interestRateElement = document.getElementById('interestRate');
                            const taxRateElement = document.getElementById('taxRate');    

                            if (!transferDateElement || !capitalElement || !monthsElement || !settlementElement || !finalPaymentElement || !interestRateElement || !taxRateElement) {
                                console.error('One or more input elements are null:', {
                                    transferDate: transferDateElement,
                                    capital: capitalElement,
                                    months: monthsElement,
                                    settlement: settlementElement,
                                    finalPayment: finalPaymentElement,
                                    interestRate: interestRateElement,
                                    taxRate: taxRateElement
                                });
                                alert('Wprowadź poprawną datę, kapitał własny, stopę procentową, procent spłaty i stawkę podatku!');
                                return;
                            }

                            const transferDate = new Date(transferDateElement.value);
                            const capital = parseFloat(capitalElement.value) || 0;
                            const months = parseInt(monthsElement.value) || 12;
                            const settlement = settlementElement.value;
                            const finalPaymentPercent = parseFloat(finalPaymentElement.value) || 0;
                            // Używamy pełnej precyzji do obliczeń, jeśli jest dostępna
                            const interestRate = parseFloat(interestRateElement.getAttribute('data-full-value') || interestRateElement.value) || 0;
                            const taxRate = parseFloat(taxRateElement.value) || 0;    
                            
                            console.log('Dane wejściowe:', {
                                transferDate: transferDate.toISOString(),
                                capital,
                                months,
                                settlement,
                                finalPaymentPercent,
                                interestRate,
                                taxRate
                            });
                            
                            if (isNaN(transferDate.getTime()) || capital <= 0 || isNaN(interestRate) || isNaN(finalPaymentPercent) || isNaN(taxRate)) {
                                alert('Wprowadź poprawną datę, kapitał własny, stopę procentową, procent spłaty i stawkę podatku!');
                                return;
                            }
                            
                            // Ustal startDate na ostatni dzień NASTĘPNEGO miesiąca po dacie przelewu
                            const startDate = new Date(transferDate.getFullYear(), transferDate.getMonth() + 2, 0);
                            console.log('Obliczona data startu:', formatDate(startDate));
                            
                            document.getElementById('startDate').textContent = formatDate(startDate);
                            document.getElementById('capitalAmount').textContent = formatCurrency(capital);
                            document.getElementById('contractPeriod').textContent = months + ' miesięcy';
                            document.getElementById('interestRateValue').textContent = parseFloat(interestRate).toFixed(2) + '%';
                            
                            let settlementText = '';
                            let freq;
                            switch (settlement) {
                                case 'monthly':
                                    settlementText = 'Miesięczne';
                                    freq = 1;
                                    break;
                                case 'quarterly':
                                    settlementText = 'Kwartalne';
                                    freq = 3;
                                    break;
                                case 'semiannual':
                                    settlementText = 'Półroczne';
                                    freq = 6;
                                    break;
                                case 'annual':
                                    settlementText = 'Roczne';
                                    freq = 12;
                                    break;
                            }
                            document.getElementById('settlementType').textContent = settlementText;
                            
                            const numberOfPayments = Math.ceil(months / freq);
                            console.log('Liczba rat:', numberOfPayments);
                            
                            const finalPaymentAmount = (capital * finalPaymentPercent) / 100;
                            console.log('Kwota wykupu:', finalPaymentAmount);
                            
                            const rate = interestRate / 100;
                            const adjustedRate = (interestRate / 100) / 12 * freq;
                            const nper = numberOfPayments;
                            const pv = -(capital - finalPaymentAmount);
                            console.log('PMT parametry:', { rate: adjustedRate, nper, pv });
                            
                            let paymentPerPeriod = 0;
                            if (interestRate > 0) {
                                paymentPerPeriod = pmt(adjustedRate, nper, pv, 0);
                            } else {
                                paymentPerPeriod = -pv / nper;
                            }
                            console.log('Rata PMT:', paymentPerPeriod);
                            
                            const interestOnFinalPayment = adjustedRate * finalPaymentAmount;
                            console.log('Odsetki od finalPaymentAmount:', interestOnFinalPayment);
                            
                            const standardPayment = paymentPerPeriod + interestOnFinalPayment;
                            console.log('Standardowa rata:', standardPayment);
                            
                            // Obliczanie bonusu, jeśli wpłata dokonana do 15 dnia miesiąca
                            const transferDay = transferDate.getDate();
                            const isBonusApplicable = transferDay <= 15;
                            const bonusAmount = isBonusApplicable ? capital * 0.005 : 0; // 0.5% od kapitału
                            console.log('Bonus:', isBonusApplicable ? `${bonusAmount} zł` : 'Brak');
                            
                            const scheduleBody = document.getElementById('scheduleBody');
                            if (scheduleBody) {
                                scheduleBody.innerHTML = '';
                                let paymentIndex = 1; // Licznik dla numeracji rat w tabeli
                                
                                // Oblicz datę bonusu (3 miesiące od daty startu)
                                const bonusDate = new Date(startDate.getFullYear(), startDate.getMonth() + 3, 0); // Ostatni dzień 3. miesiąca po dacie startu
                                
                                // Lista wszystkich płatności (regularnych i bonusowych)
                                let payments = [];
                                
                                // --- LOGIKA DLA OBLICZANIA DAT WYPŁAT ---
                                let firstPaymentCalculatedDate;    

                                if (settlement === 'monthly') {
                                    firstPaymentCalculatedDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);    
                                } else {
                                    // Dla kwartalnych, półrocznych, rocznych, startujemy od pierwszego możliwego "ostatniego dnia miesiąca"
                                    // po dacie transferu, który jest również końcem okresu rozliczeniowego.
                                    let currentMonth = transferDate.getMonth() + 1; // Miesiąc po transferze
                                    let currentYear = transferDate.getFullYear();
                                    
                                    let nextPaymentMonth;
                                    if (settlement === 'quarterly') {
                                        nextPaymentMonth = Math.ceil(currentMonth / 3) * 3; // Następny koniec kwartału
                                    } else if (settlement === 'semiannual') {
                                        nextPaymentMonth = Math.ceil(currentMonth / 6) * 6; // Następny koniec półrocza
                                    } else if (settlement === 'annual') {
                                        nextPaymentMonth = 12; // Koniec roku
                                    }

                                    // Jeśli miesiąc płatności jest mniejszy niż bieżący miesiąc po transferze,
                                    // oznacza to, że następny okres jest w kolejnym roku.
                                    if (nextPaymentMonth <= currentMonth) {
                                        currentYear++;
                                        if (settlement === 'annual') nextPaymentMonth = 12;
                                        else if (settlement === 'semiannual') nextPaymentMonth = 6;
                                        else if (settlement === 'quarterly') nextPaymentMonth = 3;
                                    }

                                    firstPaymentCalculatedDate = new Date(currentYear, nextPaymentMonth, 0);
                                    // Upewniamy się, że data płatności jest po dacie startu
                                    while(firstPaymentCalculatedDate <= startDate) {
                                        firstPaymentCalculatedDate.setMonth(firstPaymentCalculatedDate.getMonth() + freq);
                                        firstPaymentCalculatedDate.setDate(0); // Ustaw na ostatni dzień miesiąca
                                    }
                                }
                                
                                for (let i = 0; i < numberOfPayments; i++) {
                                    const paymentDate = new Date(
                                        firstPaymentCalculatedDate.getFullYear(),
                                        firstPaymentCalculatedDate.getMonth() + (i * freq) + 1, // Dodaj freq, aby przejść do kolejnego okresu
                                        0 // Ostatni dzień miesiąca
                                    );
                                    
                                    let currentPaymentAmountNetto;
                                    const isLastPayment = i === numberOfPayments - 1;
                                    
                                    if (isLastPayment) {
                                        currentPaymentAmountNetto = standardPayment + finalPaymentAmount;
                                    } else {
                                        currentPaymentAmountNetto = standardPayment;
                                    }

                                    // --- OBLICZANIE PODATKU ---
                                    const taxAmount = (currentPaymentAmountNetto * taxRate) / 100;
                                    
                                    // Dodanie bonusu dla miesięcznych i kwartalnych w odpowiedniej racie
                                    const isBonusMonth = isBonusApplicable && 
                                        ((settlement === 'monthly' && i === 2) || 
                                        (settlement === 'quarterly' && i === 0)); 
                                    
                                    if (isBonusMonth && (settlement === 'monthly' || (settlement === 'quarterly' && i === 0))) {
                                         // Upewnij się, że data bonusu jest tą samą datą płatności, co w ratach miesięcznych/kwartalnych
                                         // W przypadku miesięcznych, bonus jest w 3 racie (indeks 2)
                                         // W przypadku kwartalnych, bonus jest w 1 racie (indeks 0)
                                         currentPaymentAmountNetto += bonusAmount;
                                    }

                                    payments.push({
                                        date: paymentDate,
                                        amountNetto: currentPaymentAmountNetto,
                                        taxAmount: taxAmount,    
                                        isLast: isLastPayment,
                                        isBonus: isBonusMonth,
                                        isBonusOnly: false
                                    });
                                }
                                
                                // Dodaj osobną płatność bonusową dla półrocznych i rocznych
                                if (isBonusApplicable && (settlement === 'semiannual' || settlement === 'annual')) {
                                    const bonusTaxAmount = (bonusAmount * taxRate) / 100;
                                    payments.push({
                                        date: bonusDate,
                                        amountNetto: bonusAmount,
                                        taxAmount: bonusTaxAmount,    
                                        isLast: false,
                                        isBonus: true,
                                        isBonusOnly: true
                                    });
                                }
                                
                                // Sortuj płatności według daty
                                payments.sort((a, b) => a.date - b.date);
                                
                                // Oblicz sumę wszystkich wypłat dla partnera (netto)
                                const totalPaymentsAmount = payments.reduce((sum, payment) => sum + payment.amountNetto, 0);
                                document.getElementById('totalPayments').textContent = formatCurrency(totalPaymentsAmount);
                                
                                // Oblicz marżę partnera (suma wypłat - kapitał własny)
                                const partnerMargin = totalPaymentsAmount - capital;
                                document.getElementById('partnerMargin').textContent = formatCurrency(partnerMargin);
                                
                                // Oblicz całościową marżę z wynajmu (marża partnera / kapitał własny)
                                const totalMarginPercent = (partnerMargin / capital) * 100;
                                document.getElementById('totalMarginPercent').textContent = totalMarginPercent.toFixed(4) + '%';
                                
                                // Oblicz IRR (wewnętrzna stopa zwrotu)
                                // Przygotowanie przepływów pieniężnych dla obliczenia IRR
                                let cashFlows = [-capital]; // Początkowa inwestycja (ujemna)
                                
                                // Dodaj wszystkie płatności jako dodatnie przepływy
                                payments.forEach(payment => {
                                    // Oblicz liczbę miesięcy od daty startu do daty płatności
                                    const paymentDate = payment.date;
                                    const monthsDiff = (paymentDate.getFullYear() - startDate.getFullYear()) * 12 + 
                                                     paymentDate.getMonth() - startDate.getMonth();
                                    
                                    // Dodaj przepływ z odpowiednim indeksem czasowym
                                    while (cashFlows.length <= monthsDiff) {
                                        cashFlows.push(0); // Wypełnij zerami miesiące bez płatności
                                    }
                                    cashFlows[monthsDiff] += payment.amountNetto;
                                });
                                
                                // Użyj wartości z pola interestRate
                                const interestRateElement = document.getElementById('interestRate');
                                const interestRateValue = parseFloat(interestRateElement.value) || 0;
                                
                                document.getElementById('interestRateValue').textContent = interestRateValue.toLocaleString('pl-PL', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                }) + '%';
                                
                                // Generuj wiersze tabeli
                                payments.forEach((payment, index) => {
                                    const row = document.createElement('tr');
                                    const paymentDate = payment.date;
                                    const currentPaymentAmountNetto = payment.amountNetto;
                                    const currentPaymentAmountBrutto = currentPaymentAmountNetto * 1.23;    
                                    const currentTaxAmount = payment.taxAmount;    

                                    let displayPaymentNumber;
                                    if (payment.isBonusOnly) {
                                        displayPaymentNumber = '🎁 Bonus';
                                    } else if (payment.isBonus && !payment.isBonusOnly) {
                                        displayPaymentNumber = `🎁 ${paymentIndex}`;
                                    } else {
                                        displayPaymentNumber = paymentIndex;
                                    }

                                    if (!payment.isBonusOnly) {
                                        paymentIndex++;
                                    }
                                    
                                    row.innerHTML = `
                                        <td>${displayPaymentNumber}</td>
                                        <td>${formatDate(paymentDate)}</td>
                                        <td>${formatCurrency(currentPaymentAmountNetto)}${payment.isBonus && !payment.isBonusOnly ? ' (w tym bonus ' + formatCurrency(bonusAmount) + ')' : payment.isBonusOnly ? ' (bonus)' : ''}</td>
                                        <td>${formatCurrency(currentTaxAmount)}</td>    
                                        <td>${formatCurrency(currentPaymentAmountBrutto)}</td>
                                    `;
                                    
                                    if(payment.isBonus) {
                                        row.classList.add('bonus-month');
                                    }

                                    scheduleBody.appendChild(row);
                                    console.log(`Wpis ${payment.isBonusOnly ? 'Bonus' : index + 1}:`, { // Zmieniono na index + 1 dla logów
                                        date: formatDate(paymentDate),
                                        amountNetto: currentPaymentAmountNetto,
                                        taxAmount: currentTaxAmount,
                                        amountBrutto: currentPaymentAmountBrutto,
                                        bonus: payment.isBonus ? bonusAmount : 0,
                                        isBonusOnly: payment.isBonusOnly
                                    });
                                });
                            } else {
                                console.error('Element scheduleBody is null');
                                alert('Błąd: Kontener harmonogramu nie został znaleziony. Odśwież stronę.');
                            }
                            
                            if (elements.resultsDiv) {
                                elements.resultsDiv.classList.remove('hidden');
                            }
                            
                            if (elements.toggleScheduleBtn) {
                                elements.toggleScheduleBtn.classList.remove('open');
                            }
                            if (elements.scheduleContainer) {
                                elements.scheduleContainer.classList.remove('open');
                            }
                            if (elements.toggleScheduleBtn) {
                                elements.toggleScheduleBtn.textContent = 'Pokaż harmonogram wypłat';
                            }
                        });
                        break;
                    case 'downloadPdfBtn':
                        element.addEventListener('click', generatePdfmakePDF);
                        break;
                    case 'exportCSVBtn':
                        element.addEventListener('click', exportToCSV);
                        break;
                }
            } else {
                console.error(`Element with ID '${key}' not found in the DOM.`);
            }
        });

        ['baseInterestRate', 'months', 'capital', 'settlement', 'taxForm', 'taxRate'].forEach(id => {    
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', calculateInterestRate);
            } else {
                console.error(`Element with ID '${id}' not found in the DOM.`);
            }
        });

                // Inicjalizacja przycisku toggle dla parametrów wewnętrznych
        const toggleInternalParamsButton = document.getElementById('toggleInternalParams');
        const internalParamsSection = document.getElementById('internalParams');
        
        if (toggleInternalParamsButton && internalParamsSection) {
            toggleInternalParamsButton.addEventListener('click', function() {
                internalParamsSection.classList.toggle('open');
                toggleInternalParamsButton.classList.toggle('open');
                
                if (internalParamsSection.classList.contains('open')) {
                    toggleInternalParamsButton.textContent = 'Ukryj parametry wewnętrzne';
                } else {
                    toggleInternalParamsButton.textContent = 'Pokaż parametry wewnętrzne';
                }
            });
        }

        function calculateInterestRate() {
            const baseInterestRateElement = document.getElementById('baseInterestRate');
            const monthsElement = document.getElementById('months');
            const capitalElement = document.getElementById('capital');
            const finalPaymentElement = document.getElementById('finalPayment');
            const settlementElement = document.getElementById('settlement');
            const interestRateElement = document.getElementById('interestRate');
            const displayedInterestRateElement = document.getElementById('displayedInterestRate');
            const taxFormElement = document.getElementById('taxForm');

            if (!baseInterestRateElement || !monthsElement || !capitalElement || !finalPaymentElement || !settlementElement || !interestRateElement || !displayedInterestRateElement || !taxFormElement) {
                console.error('One or more input elements are null:', {
                    baseInterestRate: baseInterestRateElement,
                    months: monthsElement,
                    capital: capitalElement,
                    finalPayment: finalPaymentElement,    
                    settlement: settlementElement,
                    interestRate: interestRateElement,
                    displayedInterestRate: displayedInterestRateElement,
                    taxForm: taxFormElement
                });
                alert('Błąd: Jedno lub więcej pól formularza (np. forma opodatkowania) nie zostało znalezione. Sprawdź formularz lub odśwież stronę.');
                return 0;
            }

            const baseInterestRate = parseFloat(baseInterestRateElement.value) || 0;
            const months = parseInt(monthsElement.value) || 12;
            const capital = parseFloat(capitalElement.value) || 0;
            const settlement = settlementElement.value;
            const taxForm = taxFormElement.value;
            
            let freq, multiplierFreq;
            switch (settlement) {
                case 'monthly':
                    freq = 1;
                    multiplierFreq = 0.9210;
                    break;
                case 'quarterly':
                    freq = 3;
                    multiplierFreq = 0.9445;
                    break;
                case 'semiannual':
                    freq = 6;
                    multiplierFreq = 0.9810;
                    break;
                case 'annual':
                    freq = 12;
                    multiplierFreq = 1.0425;
                    break;
                default:
                    freq = 12;
                    multiplierFreq = 1.0425;
            }
            
            let multiplierMonths;
            switch (months) {
                case 12:
                    multiplierMonths = 0.9700;
                    break;
                case 18:
                    multiplierMonths = 0.9800;
                    break;
                case 24:
                    multiplierMonths = 0.9900;
                    break;
                case 30:
                    multiplierMonths = 1.0500;
                    break;
                case 36:
                    multiplierMonths = 1.0850;
                    break;
                case 48:
                    multiplierMonths = 1.1520;
                    break;
                default:
                    multiplierMonths = 1.0;
            }
            
            let multiplierCapital;
            if (capital >= 10000 && capital <= 29999) {
                multiplierCapital = 1.0000;
            } else if (capital >= 30000 && capital <= 49999) {
                multiplierCapital = 1.0655;
            } else if (capital >= 50000 && capital <= 99999) {
                multiplierCapital = 1.0655;
            } else if (capital >= 100000 && capital <= 199999) {
                multiplierCapital = 1.0990;
            } else if (capital >= 200000 && capital <= 999999) {
                multiplierCapital = 1.1880;
            } else if (capital >= 1000000 && capital <= 9999999) {
                multiplierCapital = 1.1880;
            } else {
                multiplierCapital = 1.0000;
            }
            
            let finalPaymentPercent;
            switch (months) {
                case 12:
                    finalPaymentPercent = taxForm === 'liniowy' ? 75.0 : 100.0;
                    break;
                case 18:
                    finalPaymentPercent = taxForm === 'liniowy' ? 62.5 : 90.0;
                    break;
                case 24:
                    finalPaymentPercent = taxForm === 'liniowy' ? 50.0 : 80.0;
                    break;
                case 30:
                    finalPaymentPercent = taxForm === 'liniowy' ? 37.5 : 70.0;
                    break;
                case 36:
                    finalPaymentPercent = taxForm === 'liniowy' ? 25.0 : 60.0;
                    break;
                case 48:
                    finalPaymentPercent = taxForm === 'liniowy' ? 0.0 : 40.0;
                    break;
                default:
                    finalPaymentPercent = taxForm === 'liniowy' ? 25.0 : 60.0;
            }
            
            finalPaymentElement.value = finalPaymentPercent;
            
            const multiplierFinalPayment = 1;
            
            const interestRate = baseInterestRate * multiplierMonths * multiplierCapital * multiplierFinalPayment * multiplierFreq;
            
            displayedInterestRateElement.textContent = interestRate.toFixed(2) + '%';
            // Wyświetlamy zaokrągloną wartość, ale zachowujemy pełną precyzję w zmiennej
            interestRateElement.value = interestRate.toFixed(2);
            interestRateElement.setAttribute('data-full-value', interestRate.toFixed(8));
            
            return interestRate;
        }
        
        calculateInterestRate();
        
        function formatDate(date) {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}.${month}.${year}`;
        }
        
        function pmt(rate, nper, pv, fv = 0, type = 0) {
            if (rate === 0) return -(pv + fv) / nper;
            
            const pvif = Math.pow(1 + rate, nper);
            let pmt = rate / (pvif - 1) * -(pv * pvif + fv);
            
            if (type === 1) {
                pmt = pmt / (1 + rate);
            }
            
            return pmt;
        }
        
        // Funkcja do obliczania IRR (wewnętrznej stopy zwrotu)
        function calculateIRR(cashFlows, guess = 0.1) {
            const maxIterations = 1000;
            const tolerance = 0.0000001;
            
            let rate = guess;
            
            for (let i = 0; i < maxIterations; i++) {
                let npv = 0;
                let derivativeNpv = 0;
                
                for (let j = 0; j < cashFlows.length; j++) {
                    const cashFlow = cashFlows[j];
                    npv += cashFlow / Math.pow(1 + rate, j);
                    derivativeNpv -= j * cashFlow / Math.pow(1 + rate, j + 1);
                }
                
                // Zastosuj metodę Newtona-Raphsona do znalezienia miejsca zerowego
                const newRate = rate - npv / derivativeNpv;
                
                // Sprawdź zbieżność
                if (Math.abs(newRate - rate) < tolerance) {
                    return newRate;
                }
                
                rate = newRate;
            }
            
            // Jeśli nie znaleziono zbieżności, zwróć najlepsze przybliżenie
            return rate;
        }
        
        function formatCurrency(amount) {
            return amount.toLocaleString('pl-PL', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }) + ' zł';
        }

        function generatePdfmakePDF() {
            const companyName = elements.companyNameInput.value.trim();
            const infoData = [
                ['Data startu:', document.getElementById('startDate')?.textContent || '---'],
                ['Kapitał własny:', document.getElementById('capitalAmount')?.textContent || '---'],
                ['Okres umowy:', document.getElementById('contractPeriod')?.textContent || '---'],
                ['Stopa procentowa:', document.getElementById('interestRateValue')?.textContent || '---'],
                ['Rozliczenie:', document.getElementById('settlementType')?.textContent || '---'],
                ['Forma opodatkowania:', document.getElementById('taxForm')?.value === 'ryczalt' ? 'Ryczałt' : 'Liniowy'],
                ['Stawka podatku:', document.getElementById('taxRate')?.value + '%' || '---']
            ];

            const scheduleBody = document.getElementById('scheduleBody');
            if (!scheduleBody || scheduleBody.children.length === 0) {
                alert('Harmonogram nie został jeszcze wygenerowany.');
                return;
            }

            const tableRows = [];
            // Nagłówki tabeli
            tableRows.push([
                { text: 'Nr raty', style: 'tableHeader' },
                { text: 'Data', style: 'tableHeader' },
                { text: 'Kwota netto (zł)', style: 'tableHeader' },
                { text: 'Podatek (zł)', style: 'tableHeader' },
                { text: 'Kwota brutto (zł)', style: 'tableHeader' }
            ]);

            // Dane tabeli
            Array.from(scheduleBody.children).forEach(row => {
                const cells = Array.from(row.children);
                const rowData = cells.map((cell, index) => {
                    let text = cell.textContent.trim();
                    let style = 'tableCell';

                    // Jeśli wiersz ma klasę 'bonus-month', zmień styl tekstu
                    if (row.classList.contains('bonus-month')) {
                        style = 'bonusCell';
                    }

                    // Specjalne formatowanie dla kolumny Kwota netto, żeby bonus był w nowej linii, jeśli jest
                    if (index === 2 && text.includes('(w tym bonus')) {
                        const parts = text.split('(w tym bonus');
                        return { text: [parts[0].trim(), { text: '\n(w tym bonus' + parts[1], fontSize: 7, color: '#0ea5e9' }], style: style };
                    } else if (index === 2 && text.includes('(bonus)')) {
                        return { text: [text.replace('(bonus)', '').trim(), { text: '\n(bonus)', fontSize: 7, color: '#0ea5e9' }], style: style };
                    }
                    
                    return { text: text, style: style };
                });
                tableRows.push(rowData);
            });

            const docDefinition = {
                content: [
                    // Conditional logo display
                    CONFIG.COMPANY_LOGO_BASE64 && CONFIG.COMPANY_LOGO_BASE64 !== 'kod64'
                        image: CONFIG.COMPANY_LOGO_BASE64,
                        width: 100,
                        alignment: 'center',
                        margin: [0, 0, 0, 20]
                    } : null,
                    { text: 'Harmonogram Wypłat Partnerów', style: 'header', alignment: 'center' },
                    {
                        text: `Wygenerowano: ${new Date().toLocaleDateString('pl-PL', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}`,
                        style: 'subheader',
                        alignment: 'center',
                        margin: [0, 0, 0, 20]
                    },
                    { text: 'Warunki współpracy', style: 'sectionHeader', margin: [0, 10, 0, 10] },
                    {
                        columns: [
                            {
                                width: '50%',
                                ul: infoData.filter((_, i) => i % 2 === 0).map(item => ({ text: [{ text: item[0], bold: true }, ` ${item[1]}`], margin: [0, 2] }))
                            },
                            {
                                width: '50%',
                                ul: infoData.filter((_, i) => i % 2 !== 0).map(item => ({ text: [{ text: item[0], bold: true }, ` ${item[1]}`], margin: [0, 2] }))
                            }
                        ],
                        columnGap: 20,
                        margin: [0, 0, 0, 20]
                    },
                    { text: 'Harmonogram płatności', style: 'sectionHeader', margin: [0, 10, 0, 10] },
                    {
                        table: {
                            headerRows: 1,
                            widths: ['auto', 'auto', '*', 'auto', '*'],
                            body: tableRows
                        },
                        layout: {
                            fillColor: function (rowIndex, node, columnIndex) {
                                if (rowIndex === 0) return '#F1F5F9';
                                const originalRow = scheduleBody.children[rowIndex - 1];
                                if (originalRow && originalRow.classList.contains('bonus-month')) {
                                    return '#E0F2F7';
                                }
                                return (rowIndex % 2 === 0) ? '#FCFDFE' : null;
                            },
                            hLineWidth: function (i, node) { return (i === 0 || i === node.table.body.length) ? 0 : 0.5; },
                            vLineWidth: function (i, node) { return 0; },
                            hLineColor: function (i, node) { return '#E2E8F0'; },
                            paddingLeft: function(i, node) { return 5; },
                            paddingRight: function(i, node) { return 5; },
                            paddingTop: function(i, node) { return 8; },
                            paddingBottom: function(i, node) { return 8; }
                        }
                    }
                ].filter(Boolean),
                styles: {
                    header: {
                        fontSize: 22,
                        bold: true,
                        color: '#090d2e',
                        margin: [0, 0, 0, 10]
                    },
                    subheader: {
                        fontSize: 10,
                        color: '#64748b',
                    },
                    sectionHeader: {
                        fontSize: 14,
                        bold: true,
                        color: '#090d2e',
                    },
                    tableHeader: {
                        bold: true,
                        fontSize: 9,
                        color: '#475569',
                        alignment: 'left',
                        fillColor: '#F1F5F9',
                        margin: [0,0,0,0]
                    },
                    tableCell: {
                        fontSize: 8,
                        color: '#1e293b',
                        alignment: 'left',
                        margin: [0,0,0,0]
                    },
                    bonusCell: {
                        fontSize: 8,
                        color: '#0ea5e9',
                        bold: true,
                        alignment: 'left',
                        margin: [0,0,0,0]
                    }
                },
                defaultStyle: {
                    font: 'Roboto'
                }
            };

            // Generowanie nazwy pliku PDF
            const sanitizedCompanyName = companyName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const filename = `${sanitizedCompanyName}_harmonogram_${new Date().toISOString().split('T')[0]}.pdf`;

            // Użycie pdfmake do wygenerowania PDF
            pdfMake.createPdf(docDefinition).download(filename);
        }

        function exportToCSV() {
            const scheduleBody = document.getElementById('scheduleBody');
            if (!scheduleBody) return;
            
            let csvContent = "Nr raty,Data płatności,Kwota netto (zł),Podatek (zł),Kwota brutto (zł)\n";
            
            Array.from(scheduleBody.children).forEach(row => {
                const cells = Array.from(row.children);
                const rowData = cells.map(cell => {
                    let text = cell.textContent.trim();
                    // Czyść tekst z dodatkowych informacji o bonusie dla CSV
                    text = text.replace(/\(w tym bonus.*?\)/g, '');
                    text = text.replace(/\(bonus\)/g, '');
                    return `"${text}"`;
                });
                csvContent += rowData.join(',') + '\n';
            });
            
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `harmonogram_wyplat_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
        }

        // Dodaj przycisk eksportu CSV (jeśli jeszcze go nie ma, aby uniknąć duplikatów po ponownej inicjalizacji)
        function addCSVExportButton() {
            const buttonRow = document.querySelector('.button-row-results');
            if (buttonRow && !document.getElementById('exportCSV')) {
                const csvButton = document.createElement('button');
                csvButton.id = 'exportCSV';
                csvButton.className = 'btn btn-secondary';
                csvButton.textContent = 'Eksportuj do CSV';
                csvButton.addEventListener('click', exportToCSV);
                buttonRow.appendChild(csvButton);
            }
        }

        // Wywołaj funkcję dodającą przycisk CSV po załadowaniu kalkulatora
        addCSVExportButton();
    } // End of initializeCalculator function
});