<?php

namespace Tests\Fakes;

use Stripe\Account;
use Stripe\Balance;
use Stripe\Checkout\Session;
use Stripe\Exception\InvalidRequestException;
use Stripe\Exception\PermissionException;
use Stripe\PaymentIntent;
use Stripe\StripeClient;
use Stripe\Transfer;

/**
 * Stands in for the Stripe API: records calls instead of sending them.
 *
 * Connected accounts are ready to be paid unless listed in $accountOverrides
 * (attributes to override) or $missingAccounts (not found on Stripe).
 */
class FakeStripeClient extends StripeClient
{
    public array $transfersCreated = [];
    public array $failDestinations = [];
    public array $accountOverrides = [];
    public array $missingAccounts = [];
    public array $accountsCreated = [];
    public array $balanceCalls = [];
    public ?Session $session = null;

    public function __construct()
    {
        parent::__construct('sk_test_fake');
    }

    public function __get($name)
    {
        $fake = $this;

        return match ($name) {
            'paymentIntents' => new class {
                public function retrieve($id)
                {
                    return PaymentIntent::constructFrom(['id' => $id, 'latest_charge' => 'ch_test_1']);
                }
            },
            'transfers' => new class($fake) {
                public function __construct(private FakeStripeClient $fake) {}

                public function create($params, $opts = [])
                {
                    if (in_array($params['destination'], $this->fake->failDestinations)) {
                        throw InvalidRequestException::factory('Destination account cannot receive transfers', 400);
                    }

                    $this->fake->transfersCreated[] = ['params' => $params, 'opts' => $opts];

                    return Transfer::constructFrom(['id' => 'tr_test_' . count($this->fake->transfersCreated)]);
                }
            },
            'accounts' => new class($fake) {
                public function __construct(private FakeStripeClient $fake) {}

                public function retrieve($id)
                {
                    if (in_array($id, $this->fake->missingAccounts)) {
                        throw PermissionException::factory("The provided key does not have access to account '{$id}' (or that account does not exist)", 403);
                    }

                    return Account::constructFrom(array_merge([
                        'id' => $id,
                        'details_submitted' => true,
                        'charges_enabled' => true,
                        'payouts_enabled' => true,
                    ], $this->fake->accountOverrides[$id] ?? []));
                }

                public function create($params)
                {
                    $this->fake->accountsCreated[] = $params;

                    return Account::constructFrom(['id' => 'acct_new_' . count($this->fake->accountsCreated)]);
                }
            },
            'balance' => new class($fake) {
                public function __construct(private FakeStripeClient $fake) {}

                public function retrieve($params = null, $opts = null)
                {
                    $this->fake->balanceCalls[] = ['params' => $params, 'opts' => $opts];

                    return Balance::constructFrom([
                        'available' => [['amount' => 1500, 'currency' => 'gbp']],
                        'pending' => [],
                    ]);
                }
            },
            'checkout' => new class($fake) {
                public object $sessions;

                public function __construct(FakeStripeClient $fake)
                {
                    $this->sessions = new class($fake) {
                        public function __construct(private FakeStripeClient $fake) {}

                        public function retrieve($id)
                        {
                            return $this->fake->session;
                        }
                    };
                }
            },
        };
    }
}
