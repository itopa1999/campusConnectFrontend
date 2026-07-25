<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>CampusHub – Points & Transactions</title>

    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />

    <!-- Global Styles -->
    <link rel="stylesheet" href="/assets/css/style.css" />

    <!-- Page-Specific Styles -->
    <style>
        .points-wrapper {
            max-width: 1000px;
            margin: 0 auto;
        }

        /* ─── Points Balance Banner ─── */
        .points-balance {
            background: linear-gradient(135deg, var(--green), #1a5a2a);
            border-radius: var(--radius-card);
            padding: 24px 28px;
            margin-bottom: 24px;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 12px 20px;
            border: 1px solid var(--border-color);
            transition: background var(--transition), border-color var(--transition);
        }
        .points-balance .balance-left {
            display: flex;
            align-items: center;
            gap: 16px;
        }
        .points-balance .balance-icon {
            font-size: 36px;
            opacity: 0.8;
        }
        .points-balance .balance-text .balance-label {
            font-size: 13px;
            opacity: 0.8;
        }
        .points-balance .balance-text .balance-amount {
            font-size: 32px;
            font-weight: 800;
            letter-spacing: -0.5px;
            line-height: 1.2;
        }
        .points-balance .balance-right {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
        }
        .points-balance .balance-right .points-value {
            font-size: 14px;
            font-weight: 600;
            background: rgba(255, 255, 255, 0.15);
            padding: 4px 16px;
            border-radius: 30px;
        }
        .points-balance .balance-right .buy-points-btn {
            background: #fff;
            color: var(--green);
            border: none;
            padding: 8px 22px;
            border-radius: 30px;
            font-weight: 700;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
        }
        .points-balance .balance-right .buy-points-btn:hover {
            transform: scale(1.03);
            opacity: 0.9;
        }
        .dark-mode .points-balance {
            background: linear-gradient(135deg, #1a3a2a, #0d2a1a);
            border-color: #2a3a2a;
        }
        .dark-mode .points-balance .balance-right .buy-points-btn {
            background: #2a2a2a;
            color: #2ecc71;
        }

        @media (max-width: 480px) {
            .points-balance {
                padding: 18px 16px;
                flex-direction: column;
                align-items: stretch;
                text-align: center;
            }
            .points-balance .balance-left {
                justify-content: center;
            }
            .points-balance .balance-text .balance-amount {
                font-size: 26px;
            }
            .points-balance .balance-right {
                justify-content: center;
            }
        }

        /* ─── Packages Grid ─── */
        .packages-section {
            margin-bottom: 28px;
        }
        .packages-section .section-title {
            font-size: 18px;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 10px;
            transition: color var(--transition);
        }
        .packages-section .section-title i {
            color: var(--green);
        }

        .packages-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 14px;
        }
        .package-card {
            background: var(--bg-card);
            border-radius: var(--radius-card);
            padding: 18px 16px 20px;
            border: 2px solid var(--border-color);
            box-shadow: var(--shadow-card);
            transition: all var(--transition);
            text-align: center;
            cursor: pointer;
            position: relative;
        }
        .package-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-card-hover);
            border-color: var(--green);
        }
        .package-card .package-points {
            font-size: 28px;
            font-weight: 800;
            color: var(--green);
            transition: color var(--transition);
        }
        .package-card .package-points small {
            font-size: 14px;
            font-weight: 400;
            color: var(--text-muted);
        }
        .package-card .package-price {
            font-size: 18px;
            font-weight: 700;
            color: var(--text-primary);
            margin: 4px 0;
            transition: color var(--transition);
        }
        .package-card .package-price small {
            font-size: 13px;
            font-weight: 400;
            color: var(--text-muted);
        }
        .package-card .package-save {
            font-size: 13px;
            font-weight: 600;
            color: var(--red);
            background: rgba(231, 76, 60, 0.08);
            padding: 2px 14px;
            border-radius: 20px;
            display: inline-block;
            margin-top: 4px;
        }
        .package-card .package-badge {
            position: absolute;
            top: -8px;
            right: 12px;
            background: var(--red);
            color: #fff;
            font-size: 10px;
            font-weight: 700;
            padding: 2px 14px;
            border-radius: 30px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }
        .package-card .package-badge.popular {
            background: #e67e22;
        }
        .dark-mode .package-card:hover {
            border-color: #2ecc71;
        }
        .dark-mode .package-card .package-save {
            background: rgba(231, 76, 60, 0.15);
        }

        @media (max-width: 480px) {
            .packages-grid {
                grid-template-columns: 1fr 1fr;
                gap: 10px;
            }
            .package-card {
                padding: 14px 12px 16px;
            }
            .package-card .package-points {
                font-size: 22px;
            }
            .package-card .package-price {
                font-size: 15px;
            }
            .package-card .package-save {
                font-size: 11px;
                padding: 1px 10px;
            }
        }

        /* ─── Payment Gateway Modal ─── */
        .payment-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(6px);
            -webkit-backdrop-filter: blur(6px);
            z-index: 9999;
            display: none;
            align-items: center;
            justify-content: center;
            padding: 20px;
            opacity: 0;
            transition: opacity 0.35s ease;
        }
        .payment-overlay.active {
            display: flex;
            opacity: 1;
        }

        .payment-modal {
            background: var(--bg-card);
            border-radius: var(--radius-card);
            max-width: 480px;
            width: 100%;
            padding: 28px 28px 24px;
            box-shadow: 0 24px 64px rgba(0, 0, 0, 0.2);
            transform: scale(0.92) translateY(20px);
            transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.35s ease;
            opacity: 0;
            border: 1px solid var(--border-color);
            max-height: 90vh;
            overflow-y: auto;
        }
        .payment-overlay.active .payment-modal {
            transform: scale(1) translateY(0);
            opacity: 1;
        }

        .payment-modal .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 16px;
        }
        .payment-modal .modal-header .modal-title {
            font-size: 20px;
            font-weight: 700;
            color: var(--text-primary);
            transition: color var(--transition);
        }
        .payment-modal .modal-header .modal-title small {
            display: block;
            font-size: 14px;
            font-weight: 400;
            color: var(--text-muted);
            margin-top: 2px;
            transition: color var(--transition);
        }
        .payment-modal .modal-header .modal-close {
            background: none;
            border: none;
            font-size: 24px;
            color: var(--text-muted2);
            cursor: pointer;
            padding: 0 4px;
            transition: color 0.2s, transform 0.2s;
            line-height: 1;
        }
        .payment-modal .modal-header .modal-close:hover {
            color: var(--red);
            transform: rotate(90deg);
        }

        .payment-modal .package-summary {
            background: var(--bg-input);
            border-radius: 12px;
            padding: 12px 16px;
            margin-bottom: 18px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 8px;
            transition: background var(--transition);
        }
        .payment-modal .package-summary .summary-label {
            font-size: 13px;
            color: var(--text-muted);
            transition: color var(--transition);
        }
        .payment-modal .package-summary .summary-value {
            font-size: 16px;
            font-weight: 700;
            color: var(--text-primary);
            transition: color var(--transition);
        }
        .payment-modal .package-summary .summary-value .points-highlight {
            color: var(--green);
        }

        .payment-modal .gateway-label {
            font-size: 14px;
            font-weight: 600;
            color: var(--text-secondary);
            margin-bottom: 10px;
            transition: color var(--transition);
        }

        .payment-modal .gateway-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 10px;
            margin-bottom: 20px;
        }
        .payment-modal .gateway-option {
            padding: 14px 10px;
            border-radius: 12px;
            border: 2px solid var(--border-color);
            background: var(--bg-input);
            text-align: center;
            cursor: pointer;
            transition: all 0.25s ease;
            position: relative;
        }
        .payment-modal .gateway-option:hover {
            border-color: var(--green);
            background: var(--bg-card);
        }
        .payment-modal .gateway-option.selected {
            border-color: var(--green);
            background: var(--green-bg);
            box-shadow: 0 0 0 3px rgba(13, 138, 62, 0.08);
        }
        .payment-modal .gateway-option .gateway-icon {
            font-size: 28px;
            display: block;
            margin-bottom: 4px;
            color: var(--text-secondary);
            transition: color var(--transition);
        }
        .payment-modal .gateway-option.selected .gateway-icon {
            color: var(--green);
        }
        .payment-modal .gateway-option .gateway-name {
            font-size: 13px;
            font-weight: 600;
            color: var(--text-primary);
            transition: color var(--transition);
        }
        .payment-modal .gateway-option .gateway-check {
            position: absolute;
            top: -6px;
            right: -6px;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: var(--green);
            color: #fff;
            display: none;
            align-items: center;
            justify-content: center;
            font-size: 11px;
        }
        .payment-modal .gateway-option.selected .gateway-check {
            display: flex;
        }
        .dark-mode .payment-modal .gateway-option.selected {
            background: rgba(46, 204, 113, 0.06);
        }

        .payment-modal .modal-actions {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            margin-top: 4px;
        }
        .payment-modal .modal-actions button {
            flex: 1;
            padding: 12px 0;
            border-radius: 30px;
            font-size: 14px;
            font-weight: 600;
            border: none;
            cursor: pointer;
            transition: all 0.2s;
            min-width: 100px;
        }
        .payment-modal .modal-actions .btn-pay {
            background: var(--green);
            color: #ffffff;
        }
        .payment-modal .modal-actions .btn-pay:hover {
            opacity: 0.9;
            transform: scale(0.98);
        }
        .payment-modal .modal-actions .btn-pay:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }
        .payment-modal .modal-actions .btn-cancel {
            background: var(--bg-input);
            color: var(--text-secondary);
        }
        .payment-modal .modal-actions .btn-cancel:hover {
            background: var(--border-color);
        }

        @media (max-width: 480px) {
            .payment-modal .gateway-grid {
                grid-template-columns: 1fr;
                gap: 8px;
            }
            .payment-modal {
                padding: 20px 18px 18px;
            }
            .payment-modal .modal-actions button {
                min-width: 80px;
                font-size: 13px;
                padding: 10px 0;
            }
        }

        /* ─── Tabs ─── */
        .points-tabs {
            display: flex;
            gap: 6px;
            margin-bottom: 20px;
            padding: 4px;
            background: var(--bg-input);
            border-radius: 16px;
            border: 1px solid var(--border-color);
            transition: background var(--transition), border-color var(--transition);
            overflow-x: auto;
            flex-wrap: nowrap;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
        }
        .points-tabs::-webkit-scrollbar {
            display: none;
        }
        .points-tabs .tab-btn {
            flex: 1;
            padding: 10px 16px;
            border: none;
            background: transparent;
            color: var(--text-secondary);
            font-weight: 600;
            font-size: 13px;
            cursor: pointer;
            border-radius: 12px;
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            white-space: nowrap;
            min-width: fit-content;
        }
        .points-tabs .tab-btn i {
            font-size: 15px;
            transition: transform 0.3s ease;
        }
        .points-tabs .tab-btn:hover {
            color: var(--text-primary);
            background: rgba(255, 255, 255, 0.5);
        }
        .points-tabs .tab-btn.active {
            background: var(--bg-card);
            color: var(--green);
            box-shadow: 0 4px 16px rgba(13, 138, 62, 0.15);
            transform: scale(1.02);
        }
        .points-tabs .tab-btn.active i {
            transform: scale(1.1);
        }
        .points-tabs .tab-btn .tab-badge {
            background: var(--green);
            color: #fff;
            font-size: 9px;
            font-weight: 700;
            padding: 1px 8px;
            border-radius: 20px;
            margin-left: 4px;
        }
        .dark-mode .points-tabs {
            background: var(--bg-input);
            border-color: var(--border-color);
        }
        .dark-mode .points-tabs .tab-btn:hover {
            background: rgba(255, 255, 255, 0.05);
        }
        .dark-mode .points-tabs .tab-btn.active {
            background: var(--bg-card);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
        }
        @media (max-width: 480px) {
            .points-tabs .tab-btn {
                font-size: 11px;
                padding: 8px 12px;
                gap: 5px;
            }
            .points-tabs .tab-btn i {
                font-size: 13px;
            }
        }

        /* ─── Filters ─── */
        .filter-row {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
            margin-bottom: 16px;
        }
        .filter-row .filter-group {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-wrap: wrap;
        }
        .filter-row .filter-group label {
            font-size: 12px;
            font-weight: 600;
            color: var(--text-muted);
            transition: color var(--transition);
        }
        .filter-row .filter-group input[type="date"] {
            padding: 8px 12px;
            border-radius: 10px;
            border: 1px solid var(--border-color);
            background: var(--bg-input);
            color: var(--text-primary);
            font-size: 13px;
            outline: none;
            transition: all 0.25s ease;
        }
        .filter-row .filter-group input[type="date"]:focus {
            border-color: var(--green);
            box-shadow: 0 0 0 3px rgba(13, 138, 62, 0.08);
        }
        .filter-row .filter-group input[type="date"]::placeholder {
            color: var(--text-muted);
        }
        .filter-row .search-box {
            flex: 1;
            min-width: 150px;
            display: flex;
            align-items: center;
            background: var(--bg-input);
            border-radius: 28px;
            padding: 6px 16px;
            gap: 8px;
            border: 1px solid transparent;
            transition: all var(--transition);
        }
        .filter-row .search-box:focus-within {
            border-color: var(--green);
            background: var(--bg-card);
            box-shadow: 0 0 0 3px rgba(13, 138, 62, 0.08);
        }
        .filter-row .search-box i {
            color: var(--text-muted2);
            transition: color var(--transition);
        }
        .filter-row .search-box input {
            border: none;
            background: transparent;
            outline: none;
            flex: 1;
            font-size: 13px;
            color: var(--text-primary);
            padding: 4px 0;
            width: 100%;
            transition: color var(--transition);
        }
        .filter-row .search-box input::placeholder {
            color: var(--text-muted);
        }
        .filter-row .search-box .clear-filter-search {
            background: none;
            border: none;
            color: var(--text-muted);
            cursor: pointer;
            font-size: 16px;
            padding: 0 4px;
            transition: color 0.2s;
            display: none;
        }
        .filter-row .search-box .clear-filter-search.visible {
            display: block;
        }
        .filter-row .search-box .clear-filter-search:hover {
            color: var(--red);
        }
        .filter-row .filter-actions {
            display: flex;
            gap: 6px;
        }
        .filter-row .filter-actions button {
            padding: 6px 16px;
            border-radius: 30px;
            border: 1px solid var(--border-color);
            background: var(--bg-card);
            color: var(--text-secondary);
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }
        .filter-row .filter-actions button:hover {
            border-color: var(--green);
            color: var(--green);
            background: var(--green-bg);
        }
        .filter-row .filter-actions button.btn-clear-filter {
            border-color: transparent;
            color: var(--text-muted);
        }
        .filter-row .filter-actions button.btn-clear-filter:hover {
            border-color: var(--red);
            color: var(--red);
            background: rgba(231, 76, 60, 0.06);
        }
        .filter-row .result-count {
            font-size: 13px;
            color: var(--text-muted);
            font-weight: 500;
            white-space: nowrap;
            transition: color var(--transition);
            margin-left: auto;
        }

        @media (max-width: 480px) {
            .filter-row {
                flex-direction: column;
                align-items: stretch;
            }
            .filter-row .filter-group {
                justify-content: stretch;
            }
            .filter-row .filter-group input[type="date"] {
                flex: 1;
            }
            .filter-row .search-box {
                min-width: 100%;
            }
            .filter-row .result-count {
                margin-left: 0;
                text-align: center;
            }
            .filter-row .filter-actions {
                justify-content: center;
            }
        }

        /* ─── Table ─── */
        .table-wrap {
            overflow-x: auto;
            border-radius: 12px;
            border: 1px solid var(--border-color);
            background: var(--bg-card);
            transition: border-color var(--transition), background var(--transition);
        }
        .table-wrap table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
        }
        .table-wrap table thead {
            background: var(--bg-input);
            transition: background var(--transition);
        }
        .table-wrap table th {
            padding: 12px 16px;
            text-align: left;
            font-weight: 600;
            color: var(--text-secondary);
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            border-bottom: 1px solid var(--border-color);
            transition: color var(--transition), border-color var(--transition);
            white-space: nowrap;
        }
        .table-wrap table td {
            padding: 12px 16px;
            color: var(--text-primary);
            border-bottom: 1px solid var(--border-color);
            transition: color var(--transition), border-color var(--transition);
            vertical-align: middle;
        }
        .table-wrap table tbody tr:last-child td {
            border-bottom: none;
        }
        .table-wrap table tbody tr:hover {
            background: var(--bg-input);
            transition: background var(--transition);
        }
        .table-wrap table .status-badge {
            font-size: 11px;
            font-weight: 700;
            padding: 2px 14px;
            border-radius: 30px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            display: inline-block;
        }
        .table-wrap table .status-badge.completed {
            background: var(--green-bg);
            color: var(--green);
        }
        .table-wrap table .status-badge.pending {
            background: #fef3e8;
            color: #e67e22;
        }
        .table-wrap table .status-badge.failed {
            background: #fde8e8;
            color: var(--red);
        }
        .dark-mode .table-wrap table .status-badge.completed {
            background: #1a3a2a;
            color: #2ecc71;
        }
        .dark-mode .table-wrap table .status-badge.pending {
            background: #3a2a1a;
            color: #f39c12;
        }
        .dark-mode .table-wrap table .status-badge.failed {
            background: #3a1a1a;
            color: #e74c3c;
        }
        .table-wrap table .points-amount {
            font-weight: 700;
            color: var(--green);
        }
        .table-wrap table .points-amount.negative {
            color: var(--red);
        }

        /* ─── Pagination ─── */
        .pagination-controls {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 16px;
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid var(--border-color);
        }
        .pagination-controls button {
            padding: 6px 18px;
            border: 2px solid var(--border-color);
            background: var(--bg-card);
            color: var(--text-secondary);
            border-radius: 30px;
            font-weight: 600;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .pagination-controls button:hover:not(:disabled) {
            background: var(--green-bg);
            border-color: var(--green);
            color: var(--green);
            transform: translateY(-2px);
        }
        .pagination-controls button:disabled {
            opacity: 0.3;
            cursor: not-allowed;
            transform: none;
        }
        .pagination-controls .page-info {
            font-size: 14px;
            color: var(--text-muted);
            font-weight: 500;
            min-width: 80px;
            text-align: center;
            transition: color var(--transition);
        }

        /* ─── Empty State ─── */
        .table-empty {
            text-align: center;
            padding: 40px 20px;
            color: var(--text-muted);
        }
        .table-empty .empty-icon {
            font-size: 48px;
            opacity: 0.3;
            margin-bottom: 12px;
            display: block;
        }
        .table-empty h4 {
            font-size: 16px;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 2px;
            transition: color var(--transition);
        }
        .table-empty p {
            font-size: 14px;
            color: var(--text-muted);
            transition: color var(--transition);
        }

        /* ─── Toast notification for purchase ─── */
        .points-toast {
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%) translateY(20px);
            background: var(--bg-card);
            color: var(--text-primary);
            padding: 12px 24px;
            border-radius: 14px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
            border: 1px solid var(--border-color);
            font-size: 14px;
            font-weight: 500;
            z-index: 9999;
            opacity: 0;
            visibility: hidden;
            transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            display: flex;
            align-items: center;
            gap: 12px;
            white-space: nowrap;
        }
        .points-toast.visible {
            opacity: 1;
            visibility: visible;
            transform: translateX(-50%) translateY(0);
        }
        .points-toast .toast-icon {
            font-size: 20px;
        }
        .points-toast .toast-icon.success {
            color: var(--green);
        }
        .points-toast .toast-icon.warning {
            color: #e67e22;
        }
        .dark-mode .points-toast {
            background: var(--bg-card);
            border-color: var(--border-color);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        }
        @media (max-width: 480px) {
            .points-toast {
                font-size: 13px;
                padding: 10px 18px;
                white-space: normal;
                max-width: 90%;
                bottom: 90px;
            }
        }

        /* ─── Tab Content ─── */
        .tab-content {
            display: none;
            animation: fadeUp 0.4s ease;
        }
        .tab-content.active {
            display: block;
        }

        /* ─── Loading ─── */
        .table-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 30px 0;
            gap: 12px;
        }
        .table-loading .spinner {
            width: 32px;
            height: 32px;
            border: 4px solid var(--border-color);
            border-top-color: var(--green);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }
        .table-loading p {
            font-size: 13px;
            color: var(--text-muted);
        }

        /* ─── Demo note ─── */
        .demo-note {
            text-align: center;
            font-size: 10px;
            color: var(--text-muted);
            padding: 8px 0 4px;
            letter-spacing: 0.3px;
            background: var(--bg-app);
            border-top: 1px solid var(--border-color);
            transition: background var(--transition), color var(--transition), border-color var(--transition);
        }
        .demo-note span {
            font-weight: 600;
            color: var(--green);
            transition: color var(--transition);
        }
    </style>
</head>
<body>

    <div class="app-container">

        <!-- ===== HEADER (injected by global.js) ===== -->

        <!-- ===== LOCATION ===== -->
        <div class="location-bar">
            <i class="fa-solid fa-location-dot"></i>
            <div class="loc-text">
                University of Benin <span>• Ugbowo</span>
            </div>
        </div>

        <!-- ===== MAIN ===== -->
        <main class="main-content" style="padding-top: 12px;">

            <div class="points-wrapper">

                <!-- ===== POINTS BALANCE ===== -->
                <div class="points-balance" id="pointsBalance">
                    <div class="balance-left">
                        <span class="balance-icon"><i class="fa-regular fa-coins"></i></span>
                        <div class="balance-text">
                            <div class="balance-label">Available Points</div>
                            <div class="balance-amount" id="userPoints">0</div>
                        </div>
                    </div>
                    <div class="balance-right">
                        <span class="points-value" id="pointsValue">0 pts</span>
                        <button class="buy-points-btn" id="scrollToPackages"><i class="fa-regular fa-cart-plus"></i> Buy Points</button>
                    </div>
                </div>

                <!-- ===== PACKAGES ===== -->
                <div class="packages-section" id="packagesSection">
                    <div class="section-title">
                        <i class="fa-regular fa-gift"></i> Point Packages
                        <span style="font-size:13px; font-weight:400; color:var(--text-muted);">Buy points to unlock premium features</span>
                    </div>
                    <div class="packages-grid" id="packagesGrid">
                        <!-- Populated by JS -->
                    </div>
                </div>

                <!-- ===== TABS ===== -->
                <div class="points-tabs" id="pointsTabs">
                    <button class="tab-btn active" data-tab="purchases">
                        <i class="fa-regular fa-receipt"></i> Purchase History
                        <span class="tab-badge" id="purchaseCount">0</span>
                    </button>
                    <button class="tab-btn" data-tab="transactions">
                        <i class="fa-regular fa-arrow-right-arrow-left"></i> Transactions
                        <span class="tab-badge" id="transactionCount">0</span>
                    </button>
                </div>

                <!-- ===== TAB: PURCHASE HISTORY ===== -->
                <div class="tab-content active" id="tabPurchases">
                    <div class="filter-row" id="purchaseFilters">
                        <div class="filter-group">
                            <label>From</label>
                            <input type="date" id="purchaseDateFrom" />
                        </div>
                        <div class="filter-group">
                            <label>To</label>
                            <input type="date" id="purchaseDateTo" />
                        </div>
                        <div class="search-box">
                            <i class="fa-solid fa-magnifying-glass"></i>
                            <input type="text" id="purchaseSearch" placeholder="Search purchases…" />
                            <button class="clear-filter-search" id="clearPurchaseSearch">&times;</button>
                        </div>
                        <div class="filter-actions">
                            <button class="btn-clear-filter" id="purchaseClearFilters">Clear</button>
                        </div>
                        <span class="result-count" id="purchaseResultCount">0 results</span>
                    </div>

                    <div class="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Transaction ID</th>
                                    <th>Package</th>
                                    <th>Points</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody id="purchaseTableBody">
                                <!-- Populated by JS -->
                            </tbody>
                        </table>
                    </div>

                    <div class="pagination-controls" id="purchasePagination">
                        <button id="purchasePrev" disabled><i class="fa-solid fa-chevron-left"></i> Prev</button>
                        <span class="page-info" id="purchasePageInfo">Page 1</span>
                        <button id="purchaseNext">Next <i class="fa-solid fa-chevron-right"></i></button>
                    </div>
                </div>

                <!-- ===== TAB: TRANSACTIONS ===== -->
                <div class="tab-content" id="tabTransactions">
                    <div class="filter-row" id="transactionFilters">
                        <div class="filter-group">
                            <label>From</label>
                            <input type="date" id="transactionDateFrom" />
                        </div>
                        <div class="filter-group">
                            <label>To</label>
                            <input type="date" id="transactionDateTo" />
                        </div>
                        <div class="search-box">
                            <i class="fa-solid fa-magnifying-glass"></i>
                            <input type="text" id="transactionSearch" placeholder="Search transactions…" />
                            <button class="clear-filter-search" id="clearTransactionSearch">&times;</button>
                        </div>
                        <div class="filter-actions">
                            <button class="btn-clear-filter" id="transactionClearFilters">Clear</button>
                        </div>
                        <span class="result-count" id="transactionResultCount">0 results</span>
                    </div>

                    <div class="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Transaction ID</th>
                                    <th>Description</th>
                                    <th>Amount</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody id="transactionTableBody">
                                <!-- Populated by JS -->
                            </tbody>
                        </table>
                    </div>

                    <div class="pagination-controls" id="transactionPagination">
                        <button id="transactionPrev" disabled><i class="fa-solid fa-chevron-left"></i> Prev</button>
                        <span class="page-info" id="transactionPageInfo">Page 1</span>
                        <button id="transactionNext">Next <i class="fa-solid fa-chevron-right"></i></button>
                    </div>
                </div>

            </div><!-- /points-wrapper -->

        </main>

        <!-- ===== PAYMENT GATEWAY MODAL ===== -->
        <div class="payment-overlay" id="paymentOverlay">
            <div class="payment-modal" id="paymentModal">
                <div class="modal-header">
                    <div>
                        <div class="modal-title" id="paymentModalTitle">Complete Purchase</div>
                        <small id="paymentModalSubtitle">Choose your payment gateway</small>
                    </div>
                    <button class="modal-close" id="paymentModalClose">&times;</button>
                </div>

                <!-- Package Summary -->
                <div class="package-summary" id="paymentSummary">
                    <span class="summary-label">You are buying</span>
                    <span class="summary-value" id="paymentSummaryText">0 points for ₦0</span>
                </div>

                <!-- Gateway Selection -->
                <div class="gateway-label">Select Payment Gateway</div>
                <div class="gateway-grid" id="gatewayGrid">
                    <div class="gateway-option" data-gateway="paystack">
                        <span class="gateway-check"><i class="fa-solid fa-check"></i></span>
                        <span class="gateway-icon"><img src="https://paystack.com/favicon.ico" alt="Paystack" style="width:32px; height:32px; border-radius:4px;" onerror="this.style.display='none';this.parentElement.textContent='💳';" /></span>
                        <span class="gateway-name">Paystack</span>
                    </div>
                    <div class="gateway-option" data-gateway="flutterwave">
                        <span class="gateway-check"><i class="fa-solid fa-check"></i></span>
                        <span class="gateway-icon"><img src="https://flutterwave.com/favicon.ico" alt="Flutterwave" style="width:32px; height:32px; border-radius:4px;" onerror="this.style.display='none';this.parentElement.textContent='💳';" /></span>
                        <span class="gateway-name">Flutterwave</span>
                    </div>
                    <div class="gateway-option" data-gateway="monnify">
                        <span class="gateway-check"><i class="fa-solid fa-check"></i></span>
                        <span class="gateway-icon"><img src="https://monnify.com/favicon.ico" alt="Monnify" style="width:32px; height:32px; border-radius:4px;" onerror="this.style.display='none';this.parentElement.textContent='💳';" /></span>
                        <span class="gateway-name">Monnify</span>
                    </div>
                </div>

                <div class="modal-actions">
                    <button class="btn-pay" id="paymentPayBtn" disabled>Pay Now</button>
                    <button class="btn-cancel" id="paymentCancelBtn">Cancel</button>
                </div>
            </div>
        </div>

        <!-- ===== TOAST ===== -->
        <div class="points-toast" id="pointsToast">
            <span class="toast-icon" id="toastIcon"><i class="fa-regular fa-circle-check"></i></span>
            <span id="toastMessage">Action completed</span>
        </div>

        <!-- ===== DEMO NOTE ===== -->
        <div class="demo-note">
            <span>CampusHub</span> • Points & Transactions • dummy data for preview
        </div>

    </div>

    <!-- ===== SCRIPTS ===== -->
    <script src="/assets/js/modal.js"></script>
    <script src="/assets/js/showAlert.js"></script>
    <script src="/assets/js/style.js"></script>

    <script>
        (function() {
            'use strict';

            // ============================================================
            // DUMMY DATA – 3 Endpoints
            // ============================================================

            // ─── 1. Point Packages ──────────────────────────────────────
            const DUMMY_PACKAGES = [{
                id: 1,
                name: 'Starter',
                points: 100,
                price: 500,
                save: 0,
                badge: null,
            }, {
                id: 2,
                name: 'Popular',
                points: 500,
                price: 2000,
                save: 500,
                badge: 'popular',
            }, {
                id: 3,
                name: 'Pro',
                points: 1500,
                price: 5000,
                save: 2500,
                badge: null,
            }, {
                id: 4,
                name: 'Ultimate',
                points: 5000,
                price: 15000,
                save: 10000,
                badge: null,
            }, ];

            // ─── 2. Purchase History ────────────────────────────────────
            const generatePurchases = () => {
                const packages = ['Starter', 'Popular', 'Pro', 'Ultimate'];
                const statuses = ['completed', 'pending', 'completed', 'completed', 'failed'];
                const data = [];
                for (let i = 1; i <= 25; i++) {
                    const pkg = packages[Math.floor(Math.random() * packages.length)];
                    const points = pkg === 'Starter' ? 100 : pkg === 'Popular' ? 500 : pkg === 'Pro' ? 1500 : 5000;
                    const price = pkg === 'Starter' ? 500 : pkg === 'Popular' ? 2000 : pkg === 'Pro' ? 5000 : 15000;
                    const status = statuses[Math.floor(Math.random() * statuses.length)];
                    const date = new Date();
                    date.setDate(date.getDate() - Math.floor(Math.random() * 60));
                    data.push({
                        id: 'PUR-' + String(1000 + i).padStart(4, '0'),
                        package: pkg,
                        points: points,
                        amount: price,
                        status: status,
                        date: date.toISOString().split('T')[0] + ' ' + ['10:30', '14:20', '09:15', '16:45', '11:00'][
                            Math.floor(Math.random() * 5)
                        ],
                        dateObj: date,
                    });
                }
                data.sort((a, b) => b.dateObj - a.dateObj);
                return data;
            };

            // ─── 3. Transaction History ────────────────────────────────
            const generateTransactions = () => {
                const descriptions = [
                    'Points purchase - Starter',
                    'Points purchase - Popular',
                    'Points purchase - Pro',
                    'Points purchase - Ultimate',
                    'Listing fee - MacBook Pro',
                    'Listing fee - iPhone 13',
                    'Listing fee - Textbook',
                    'Promotion - Banner Ad',
                    'Promotion - Hot Sale',
                    'Withdrawal - Points refund',
                ];
                const types = ['credit', 'debit', 'credit', 'debit', 'debit', 'debit', 'credit', 'debit', 'debit', 'credit'];
                const statuses = ['completed', 'completed', 'pending', 'completed', 'failed', 'completed'];
                const data = [];
                for (let i = 1; i <= 30; i++) {
                    const desc = descriptions[Math.floor(Math.random() * descriptions.length)];
                    const type = types[Math.floor(Math.random() * types.length)];
                    const amount = Math.floor(Math.random() * 20000) + 100;
                    const status = statuses[Math.floor(Math.random() * statuses.length)];
                    const date = new Date();
                    date.setDate(date.getDate() - Math.floor(Math.random() * 90));
                    data.push({
                        id: 'TXN-' + String(2000 + i).padStart(4, '0'),
                        description: desc,
                        amount: amount,
                        type: type,
                        status: status,
                        date: date.toISOString().split('T')[0] + ' ' + ['08:15', '13:30', '17:20', '10:45', '15:00'][
                            Math.floor(Math.random() * 5)
                        ],
                        dateObj: date,
                    });
                }
                data.sort((a, b) => b.dateObj - a.dateObj);
                return data;
            };

            // ─── User points ────────────────────────────────────────────
            let USER_POINTS = 2350;

            // ─── Data stores ────────────────────────────────────────────
            let allPurchases = generatePurchases();
            let allTransactions = generateTransactions();

            // ============================================================
            // DOM REFS
            // ============================================================

            const packagesGrid = document.getElementById('packagesGrid');
            const userPointsEl = document.getElementById('userPoints');
            const pointsValueEl = document.getElementById('pointsValue');

            // Tabs
            const tabBtns = document.querySelectorAll('.points-tabs .tab-btn');
            const tabPurchases = document.getElementById('tabPurchases');
            const tabTransactions = document.getElementById('tabTransactions');

            // Purchase table
            const purchaseBody = document.getElementById('purchaseTableBody');
            const purchasePrev = document.getElementById('purchasePrev');
            const purchaseNext = document.getElementById('purchaseNext');
            const purchasePageInfo = document.getElementById('purchasePageInfo');
            const purchaseResultCount = document.getElementById('purchaseResultCount');
            const purchaseCount = document.getElementById('purchaseCount');

            // Purchase filters
            const purchaseDateFrom = document.getElementById('purchaseDateFrom');
            const purchaseDateTo = document.getElementById('purchaseDateTo');
            const purchaseSearch = document.getElementById('purchaseSearch');
            const clearPurchaseSearch = document.getElementById('clearPurchaseSearch');
            const purchaseClearFilters = document.getElementById('purchaseClearFilters');

            // Transaction table
            const transactionBody = document.getElementById('transactionTableBody');
            const transactionPrev = document.getElementById('transactionPrev');
            const transactionNext = document.getElementById('transactionNext');
            const transactionPageInfo = document.getElementById('transactionPageInfo');
            const transactionResultCount = document.getElementById('transactionResultCount');
            const transactionCount = document.getElementById('transactionCount');

            // Transaction filters
            const transactionDateFrom = document.getElementById('transactionDateFrom');
            const transactionDateTo = document.getElementById('transactionDateTo');
            const transactionSearch = document.getElementById('transactionSearch');
            const clearTransactionSearch = document.getElementById('clearTransactionSearch');
            const transactionClearFilters = document.getElementById('transactionClearFilters');

            // Toast
            const toast = document.getElementById('pointsToast');
            const toastMessage = document.getElementById('toastMessage');
            const toastIcon = document.getElementById('toastIcon');

            // Scroll to packages
            const scrollBtn = document.getElementById('scrollToPackages');

            // Payment Modal
            const paymentOverlay = document.getElementById('paymentOverlay');
            const paymentModal = document.getElementById('paymentModal');
            const paymentModalClose = document.getElementById('paymentModalClose');
            const paymentCancelBtn = document.getElementById('paymentCancelBtn');
            const paymentPayBtn = document.getElementById('paymentPayBtn');
            const paymentSummaryText = document.getElementById('paymentSummaryText');
            const gatewayOptions = document.querySelectorAll('.gateway-option');
            const gatewayGrid = document.getElementById('gatewayGrid');

            // ============================================================
            // STATE
            // ============================================================

            let selectedPackage = null;
            let selectedGateway = null;

            // Purchase state
            let purchasePage = 1;
            const purchasePerPage = 8;
            let purchaseFiltered = [];

            // Transaction state
            let transactionPage = 1;
            const transactionPerPage = 8;
            let transactionFiltered = [];

            // Toast timer
            let toastTimer = null;

            // ============================================================
            // TOAST
            // ============================================================

            function showToast(message, type = 'success') {
                toastMessage.textContent = message;
                toastIcon.className = 'toast-icon';
                if (type === 'success') toastIcon.classList.add('success', 'fa-regular', 'fa-circle-check');
                else if (type === 'warning') toastIcon.classList.add('warning', 'fa-regular', 'fa-triangle-exclamation');
                else toastIcon.classList.add('success', 'fa-regular', 'fa-circle-check');

                toast.classList.add('visible');
                clearTimeout(toastTimer);
                toastTimer = setTimeout(() => {
                    toast.classList.remove('visible');
                }, 3000);
            }

            // ============================================================
            // PAYMENT MODAL
            // ============================================================

            function openPaymentModal(pkg) {
                selectedPackage = pkg;
                selectedGateway = null;

                // Update summary
                paymentSummaryText.textContent = `${pkg.points.toLocaleString()} points for ₦${pkg.price.toLocaleString()}`;

                // Reset gateway selection
                gatewayOptions.forEach(opt => opt.classList.remove('selected'));
                paymentPayBtn.disabled = true;

                // Show modal
                paymentOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            }

            function closePaymentModal() {
                paymentOverlay.classList.remove('active');
                document.body.style.overflow = '';
                selectedPackage = null;
                selectedGateway = null;
            }

            // Gateway selection
            gatewayOptions.forEach(option => {
                option.addEventListener('click', function() {
                    gatewayOptions.forEach(opt => opt.classList.remove('selected'));
                    this.classList.add('selected');
                    selectedGateway = this.dataset.gateway;
                    paymentPayBtn.disabled = false;
                });
            });

            // Close modal
            paymentModalClose.addEventListener('click', closePaymentModal);
            paymentCancelBtn.addEventListener('click', closePaymentModal);
            paymentOverlay.addEventListener('click', function(e) {
                if (e.target === paymentOverlay) closePaymentModal();
            });

            // ESC key
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && paymentOverlay.classList.contains('active')) {
                    closePaymentModal();
                }
            });

            // Pay Now
            paymentPayBtn.addEventListener('click', function() {
                if (!selectedPackage || !selectedGateway) return;

                // Disable button during processing
                paymentPayBtn.disabled = true;
                paymentPayBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing…';

                // Simulate payment processing
                setTimeout(() => {
                    // Complete purchase
                    completePurchase(selectedPackage, selectedGateway);
                    closePaymentModal();
                    paymentPayBtn.innerHTML = 'Pay Now';
                    paymentPayBtn.disabled = false;
                }, 1500);
            });

            // ============================================================
            // COMPLETE PURCHASE (after gateway selection)
            // ============================================================

            function completePurchase(pkg, gateway) {
                // Create purchase record
                const newPurchase = {
                    id: 'PUR-' + String(3000 + Math.floor(Math.random() * 9000)),
                    package: pkg.name,
                    points: pkg.points,
                    amount: pkg.price,
                    status: 'completed',
                    date: new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().slice(0, 5),
                    dateObj: new Date(),
                };

                // Add to purchases
                allPurchases.unshift(newPurchase);

                // Update user points
                USER_POINTS += pkg.points;
                updatePointsDisplay();

                // Re-render purchases
                filterPurchases();
                renderPurchases();

                // Show toast with gateway info
                const gatewayNames = {
                    paystack: 'Paystack',
                    flutterwave: 'Flutterwave',
                    monnify: 'Monnify'
                };
                showToast(`✅ ${pkg.points} points purchased via ${gatewayNames[gateway] || gateway}!`, 'success');

                if (typeof showAlert !== 'undefined') {
                    showAlert.success(`✨ ${pkg.points} points added via ${gatewayNames[gateway] || gateway}!`, { duration: 3000 });
                }
            }

            // ============================================================
            // RENDER: Packages
            // ============================================================

            function renderPackages() {
                packagesGrid.innerHTML = DUMMY_PACKAGES.map(pkg => {
                    const saveText = pkg.save > 0 ? `Save ₦${pkg.save.toLocaleString()}` : '';
                    const badgeHtml = pkg.badge ? `<span class="package-badge ${pkg.badge}">${pkg.badge}</span>` :
                    '';

                    return `
                            <div class="package-card" data-id="${pkg.id}">
                                ${badgeHtml}
                                <div class="package-points">${pkg.points.toLocaleString()} <small>pts</small></div>
                                <div class="package-price">₦${pkg.price.toLocaleString()}</div>
                                ${saveText ? `<div class="package-save">${saveText}</div>` : ''}
                                <div style="margin-top:10px; font-size:12px; color:var(--text-muted);">${pkg.name}</div>
                            </div>
                        `;
                }).join('');

                // Click to open payment modal
                packagesGrid.querySelectorAll('.package-card').forEach(card => {
                    card.addEventListener('click', function() {
                        const id = parseInt(this.dataset.id);
                        const pkg = DUMMY_PACKAGES.find(p => p.id === id);
                        if (pkg) openPaymentModal(pkg);
                    });
                });
            }

            // ============================================================
            // UPDATE POINTS DISPLAY
            // ============================================================

            function updatePointsDisplay() {
                userPointsEl.textContent = USER_POINTS.toLocaleString();
                pointsValueEl.textContent = USER_POINTS.toLocaleString() + ' pts';
            }

            // ============================================================
            // FILTER FUNCTIONS
            // ============================================================

            function filterPurchases() {
                const from = purchaseDateFrom.value;
                const to = purchaseDateTo.value;
                const search = purchaseSearch.value.toLowerCase().trim();

                purchaseFiltered = allPurchases.filter(item => {
                    if (from && item.date < from) return false;
                    if (to && item.date > to + ' 23:59:59') return false;
                    if (search) {
                        const match = item.id.toLowerCase().includes(search) ||
                            item.package.toLowerCase().includes(search) ||
                            item.status.toLowerCase().includes(search) ||
                            item.date.includes(search);
                        if (!match) return false;
                    }
                    return true;
                });

                const totalPages = Math.ceil(purchaseFiltered.length / purchasePerPage);
                if (purchasePage > totalPages) purchasePage = Math.max(1, totalPages);
                if (purchasePage < 1) purchasePage = 1;

                purchaseResultCount.textContent = `${purchaseFiltered.length} result${purchaseFiltered.length !== 1 ? 's' : ''}`;
                purchaseCount.textContent = allPurchases.length;
                renderPurchases();
            }

            function filterTransactions() {
                const from = transactionDateFrom.value;
                const to = transactionDateTo.value;
                const search = transactionSearch.value.toLowerCase().trim();

                transactionFiltered = allTransactions.filter(item => {
                    if (from && item.date < from) return false;
                    if (to && item.date > to + ' 23:59:59') return false;
                    if (search) {
                        const match = item.id.toLowerCase().includes(search) ||
                            item.description.toLowerCase().includes(search) ||
                            item.status.toLowerCase().includes(search) ||
                            item.type.toLowerCase().includes(search) ||
                            item.date.includes(search);
                        if (!match) return false;
                    }
                    return true;
                });

                const totalPages = Math.ceil(transactionFiltered.length / transactionPerPage);
                if (transactionPage > totalPages) transactionPage = Math.max(1, totalPages);
                if (transactionPage < 1) transactionPage = 1;

                transactionResultCount.textContent = `${transactionFiltered.length} result${transactionFiltered.length !== 1 ? 's' : ''}`;
                transactionCount.textContent = allTransactions.length;
                renderTransactions();
            }

            // ============================================================
            // RENDER: Purchases
            // ============================================================

            function renderPurchases() {
                const start = (purchasePage - 1) * purchasePerPage;
                const pageItems = purchaseFiltered.slice(start, start + purchasePerPage);

                const totalPages = Math.ceil(purchaseFiltered.length / purchasePerPage) || 1;
                purchasePageInfo.textContent = `Page ${purchasePage} of ${totalPages}`;
                purchasePrev.disabled = purchasePage <= 1;
                purchaseNext.disabled = purchasePage >= totalPages;

                if (pageItems.length === 0) {
                    purchaseBody.innerHTML = `
                            <tr>
                                <td colspan="6">
                                    <div class="table-empty">
                                        <span class="empty-icon"><i class="fa-regular fa-receipt"></i></span>
                                        <h4>No purchases found</h4>
                                        <p>${purchaseSearch.value ? 'Try adjusting your filters.' : 'Buy points to see your purchase history here.'}</p>
                                    </div>
                                </td>
                            </tr>
                        `;
                    return;
                }

                purchaseBody.innerHTML = pageItems.map(item => {
                    const statusClass = item.status;
                    const statusLabel = item.status.charAt(0).toUpperCase() + item.status.slice(1);

                    return `
                            <tr>
                                <td><span style="font-size:12px; font-weight:500; color:var(--text-muted);">${item.id}</span></td>
                                <td>${item.package}</td>
                                <td><span class="points-amount">${item.points.toLocaleString()}</span></td>
                                <td>₦${item.amount.toLocaleString()}</td>
                                <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
                                <td style="font-size:13px; color:var(--text-muted);">${item.date}</td>
                            </tr>
                        `;
                }).join('');
            }

            // ============================================================
            // RENDER: Transactions
            // ============================================================

            function renderTransactions() {
                const start = (transactionPage - 1) * transactionPerPage;
                const pageItems = transactionFiltered.slice(start, start + transactionPerPage);

                const totalPages = Math.ceil(transactionFiltered.length / transactionPerPage) || 1;
                transactionPageInfo.textContent = `Page ${transactionPage} of ${totalPages}`;
                transactionPrev.disabled = transactionPage <= 1;
                transactionNext.disabled = transactionPage >= totalPages;

                if (pageItems.length === 0) {
                    transactionBody.innerHTML = `
                            <tr>
                                <td colspan="6">
                                    <div class="table-empty">
                                        <span class="empty-icon"><i class="fa-regular fa-arrow-right-arrow-left"></i></span>
                                        <h4>No transactions found</h4>
                                        <p>${transactionSearch.value ? 'Try adjusting your filters.' : 'Your transaction history will appear here.'}</p>
                                    </div>
                                </td>
                            </tr>
                        `;
                    return;
                }

                transactionBody.innerHTML = pageItems.map(item => {
                    const statusClass = item.status;
                    const statusLabel = item.status.charAt(0).toUpperCase() + item.status.slice(1);
                    const typeIcon = item.type === 'credit' ? '+' : '-';
                    const typeClass = item.type === 'credit' ? 'points-amount' : 'points-amount negative';

                    return `
                            <tr>
                                <td><span style="font-size:12px; font-weight:500; color:var(--text-muted);">${item.id}</span></td>
                                <td>${item.description}</td>
                                <td><span class="${typeClass}">${typeIcon}₦${item.amount.toLocaleString()}</span></td>
                                <td><span style="text-transform:capitalize; font-weight:500;">${item.type}</span></td>
                                <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
                                <td style="font-size:13px; color:var(--text-muted);">${item.date}</td>
                            </tr>
                        `;
                }).join('');
            }

            // ============================================================
            // TAB SWITCHING
            // ============================================================

            function switchTab(tabId) {
                tabBtns.forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.tab === tabId);
                });

                tabPurchases.classList.toggle('active', tabId === 'purchases');
                tabTransactions.classList.toggle('active', tabId === 'transactions');

                if (tabId === 'purchases') {
                    filterPurchases();
                } else {
                    filterTransactions();
                }
            }

            tabBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    switchTab(this.dataset.tab);
                });
            });

            // ============================================================
            // PAGINATION EVENTS
            // ============================================================

            purchasePrev.addEventListener('click', function() {
                if (purchasePage > 1) { purchasePage--;
                    renderPurchases(); }
            });
            purchaseNext.addEventListener('click', function() {
                const totalPages = Math.ceil(purchaseFiltered.length / purchasePerPage);
                if (purchasePage < totalPages) { purchasePage++;
                    renderPurchases(); }
            });

            transactionPrev.addEventListener('click', function() {
                if (transactionPage > 1) { transactionPage--;
                    renderTransactions(); }
            });
            transactionNext.addEventListener('click', function() {
                const totalPages = Math.ceil(transactionFiltered.length / transactionPerPage);
                if (transactionPage < totalPages) { transactionPage++;
                    renderTransactions(); }
            });

            // ============================================================
            // FILTER EVENTS
            // ============================================================

            purchaseDateFrom.addEventListener('change', filterPurchases);
            purchaseDateTo.addEventListener('change', filterPurchases);
            purchaseSearch.addEventListener('input', function() {
                clearPurchaseSearch.classList.toggle('visible', !!this.value);
                purchasePage = 1;
                filterPurchases();
            });
            clearPurchaseSearch.addEventListener('click', function() {
                purchaseSearch.value = '';
                this.classList.remove('visible');
                purchasePage = 1;
                filterPurchases();
            });
            purchaseClearFilters.addEventListener('click', function() {
                purchaseDateFrom.value = '';
                purchaseDateTo.value = '';
                purchaseSearch.value = '';
                clearPurchaseSearch.classList.remove('visible');
                purchasePage = 1;
                filterPurchases();
            });

            transactionDateFrom.addEventListener('change', filterTransactions);
            transactionDateTo.addEventListener('change', filterTransactions);
            transactionSearch.addEventListener('input', function() {
                clearTransactionSearch.classList.toggle('visible', !!this.value);
                transactionPage = 1;
                filterTransactions();
            });
            clearTransactionSearch.addEventListener('click', function() {
                transactionSearch.value = '';
                this.classList.remove('visible');
                transactionPage = 1;
                filterTransactions();
            });
            transactionClearFilters.addEventListener('click', function() {
                transactionDateFrom.value = '';
                transactionDateTo.value = '';
                transactionSearch.value = '';
                clearTransactionSearch.classList.remove('visible');
                transactionPage = 1;
                filterTransactions();
            });

            // ============================================================
            // SCROLL TO PACKAGES
            // ============================================================

            scrollBtn.addEventListener('click', function() {
                document.getElementById('packagesSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
            });

            // ============================================================
            // KEYBOARD SHORTCUT: CMD+K / CTRL+K → focus search
            // ============================================================

            document.addEventListener('keydown', function(e) {
                if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                    e.preventDefault();
                    const activeTab = document.querySelector('.points-tabs .tab-btn.active');
                    if (activeTab) {
                        if (activeTab.dataset.tab === 'purchases') {
                            purchaseSearch.focus();
                        } else {
                            transactionSearch.focus();
                        }
                    }
                }
                if (e.key === 'Escape') {
                    if (document.activeElement === purchaseSearch) {
                        purchaseSearch.blur();
                        clearPurchaseSearch.classList.remove('visible');
                    }
                    if (document.activeElement === transactionSearch) {
                        transactionSearch.blur();
                        clearTransactionSearch.classList.remove('visible');
                    }
                }
            });

            // ============================================================
            // INIT
            // ============================================================

            function init() {
                renderPackages();
                updatePointsDisplay();
                filterPurchases();
                filterTransactions();
                switchTab('purchases');

                console.log('💰 Points & Transactions page initialized');
                console.log('📦 Packages:', DUMMY_PACKAGES.length);
                console.log('📋 Purchases:', allPurchases.length);
                console.log('📊 Transactions:', allTransactions.length);
            }

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', init);
            } else {
                setTimeout(init, 200);
            }

        })();
    </script>

</body>
</html>
