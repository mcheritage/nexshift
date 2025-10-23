<?php

namespace App;

enum UserRoles: string {
    case CARE_HOME_ADMIN = 'care_home_admin';
    case HEALTH_WORKER = 'health_worker';
    case NEXSHIFT_ADMIN = 'nexshift_admin';
}